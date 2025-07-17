import { describe, test, expect, beforeEach } from "bun:test";
import { LeakyBucketRateLimiter } from "./leaky_bucket_rate_limiter";

describe("LeakyBucketRateLimiter", () => {
  let limiter: LeakyBucketRateLimiter;

  beforeEach(() => {
    limiter = new LeakyBucketRateLimiter({ capacity: 3, leakRate: 1 });
  });

  test("tryAcquire allows up to capacity", () => {
    expect(limiter.tryAcquire()).toBe(true);
    expect(limiter.tryAcquire()).toBe(true);
    expect(limiter.tryAcquire()).toBe(true);
    // Should be rate limited now
    expect(limiter.tryAcquire()).toBe(false);
  });

  test("leak allows tokens to be acquired again after time passes", async () => {
    for (let i = 0; i < 3; i++) limiter.tryAcquire();
    expect(limiter.tryAcquire()).toBe(false);
    // Wait for 1.1 seconds to leak 1 token
    await new Promise((r) => setTimeout(r, 1100));
    expect(limiter.tryAcquire()).toBe(true);
  });

  test("acquire waits until a token is available", async () => {
    for (let i = 0; i < 3; i++) limiter.tryAcquire();
    const start = Date.now();
    await limiter.acquire(); // Should wait ~1s for a token to leak
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(950); // Allow some timing slack
    expect(limiter["tokens"]).toBe(3); // Should be at capacity again
  });

  test("tokens never exceed capacity", async () => {
    for (let i = 0; i < 10; i++) limiter.tryAcquire();
    // Should not exceed capacity
    expect(limiter["tokens"]).toBeLessThanOrEqual(3);
  });

  test("leak does not set tokens below zero", async () => {
    // Wait for 2 seconds to ensure leak is called with no tokens
    await new Promise((r) => setTimeout(r, 2000));
    // Should not throw or set tokens below zero
    expect(limiter["tokens"]).toBeGreaterThanOrEqual(0);
  });
}); 