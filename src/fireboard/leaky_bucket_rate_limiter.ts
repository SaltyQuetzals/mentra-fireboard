type LeakyBucketOptions = {
  capacity: number; // Maximum number of tokens in the bucket
  leakRate: number; // Number of tokens to leak per second
};

export class LeakyBucketRateLimiter {
  private capacity: number;
  private leakRate: number;
  private tokens: number;
  private lastLeakTimestamp: number;

  constructor(options: LeakyBucketOptions) {
    this.capacity = options.capacity;
    this.leakRate = options.leakRate;
    this.tokens = 0;
    this.lastLeakTimestamp = Date.now();
  }

  /**
   * Attempts to acquire a token from the bucket.
   * Returns true if allowed, false if rate limited.
   */
  public tryAcquire(): boolean {
    this.leak();
    if (this.tokens < this.capacity) {
      this.tokens++;
      return true;
    }
    return false;
  }

  /**
   * Waits until a token is available and then acquires it.
   * Useful for async/await flows.
   */
  public async acquire(): Promise<void> {
    while (true) {
      this.leak();
      if (this.tokens < this.capacity) {
        this.tokens++;
        return;
      }
      // Wait for the next leak interval
      const waitTime = 1000 / this.leakRate;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  /**
   * Leaks tokens from the bucket based on elapsed time and leak rate.
   */
  private leak() {
    const now = Date.now();
    const elapsed = (now - this.lastLeakTimestamp) / 1000; // seconds
    const leakedTokens = elapsed * this.leakRate;
    if (leakedTokens > 0) {
      this.tokens = Math.max(0, this.tokens - leakedTokens);
      this.lastLeakTimestamp = now;
    }
  }
}

