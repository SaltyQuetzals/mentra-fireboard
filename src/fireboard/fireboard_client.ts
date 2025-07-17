import {
  listAllDevices,
  listAllSessions,
  retrieveAuthenticationToken,
  retrieveRealtimeDriveDataOfDevice,
  retrieveRealtimeTemperatureOfDevice,
  retrieveSessionChartData,
  retrieveSpecificDevice,
  retrieveSpecificSession,
} from "./api";
import type { Device, Session } from "./api_types";
import { LeakyBucketRateLimiter } from "./leaky_bucket_rate_limiter";

export class FireboardClient {
  private username?: string;
  private password?: string;
  private _token?: string | undefined;
  public get token(): string | undefined {
    return this._token;
  }

  // leakRate = (200 requests/hr) / (3600 seconds)
  private rateLimiter: LeakyBucketRateLimiter = new LeakyBucketRateLimiter({ capacity: 200, leakRate: 0.0556 })

  constructor({
    username,
    password,
    token,
  }: {
    username?: string;
    password?: string;
    token?: string;
  }) {
    const credentialsProvided =
      username !== undefined || password !== undefined;
    if (credentialsProvided && token !== undefined) {
      throw Error(
        "Please provide either a username/password or an API token, but not both."
      );
    }

    if (token !== undefined) {
      this._token = token;
      return;
    }

    if (username === undefined || password === undefined) {
      throw Error("Missing username/password.");
    }
    this.username = username;
    this.password = password;
  }

  /**
   * Wraps a function call with the rate limiter, ensuring that API calls
   * are rate-limited according to the LeakyBucketRateLimiter configuration.
   * @param fn The function to call (should return a Promise)
   * @returns The result of the function call
   */
  async #rateLimited<T>(fn: () => Promise<T>): Promise<T> {
    await this.rateLimiter.acquire();
    return fn();
  }

  /**
   * See {@link https://docs.fireboard.io/app/api.html#Authentication the FireBoard Cloud API} for more details.
   * @returns The authenticated token, if successful.
   */
  public async authenticate(): Promise<void> {
    if (this.token !== undefined) {
      console.warn(
        "An authentication token has already been provided. Using that instead of requesting a new one."
      );
      return;
    }

    const token = await retrieveAuthenticationToken(
      this.username!,
      this.password!
    );
    this._token = token;
  }

  /**
   * See {@link https://docs.fireboard.io/app/api.html#Device-API the FireBoard Cloud API} for more details.
   */
  public async listAllDevices(): Promise<Device[]> {
    if (this.token === undefined) {
      throw new Error(
        `authenticate() must be run prior to calling this function.`
      );
    }

    return this.#rateLimited(() => listAllDevices(this.token!));
  }

  /**
   * See {@link https://docs.fireboard.io/app/api.html#Device-API the FireBoard Cloud API} for more details.
   * @param deviceUUID The UUID of a specific device. This can be found by calling listAllDevices
   * @returns A Device.
   */
  public async retrieveSpecificDevice(deviceUUID: string): Promise<Device> {
    if (this.token === undefined) {
      throw new Error(
        `authenticate() must be run prior to calling this function.`
      );
    }

    return this.#rateLimited(() => retrieveSpecificDevice(this.token!, deviceUUID));
  }

  /**
   * See {@link https://docs.fireboard.io/app/api.html#Device-API the FireBoard Cloud API} for more details.
   * @param deviceUUID The UUID of a specific device. This can be found by calling listAllDevices
   * @returns The Device's realtime temperature.
   */
  public async retrieveRealtimeTemperatureOfDevice(
    deviceUUID: string
  ): Promise<unknown> {
    if (this.token === undefined) {
      throw new Error(
        `authenticate() must be run prior to calling this function.`
      );
    }

    return this.#rateLimited(() => retrieveRealtimeTemperatureOfDevice(this.token!, deviceUUID));
  }
  /**
   * See {@link https://docs.fireboard.io/app/api.html#Device-API the FireBoard Cloud API} for more details.
   * @param deviceUUID The UUID of a specific device. This can be found by calling listAllDevices
   * @returns The Device's realtime drive data.
   */
  public async retrieveRealtimeDriveDataOfDevice(
    deviceUUID: string
  ): Promise<unknown[]> {
    if (this.token === undefined) {
      throw new Error(
        `authenticate() must be run prior to calling this function.`
      );
    }

    return this.#rateLimited(() => retrieveRealtimeDriveDataOfDevice(this.token!, deviceUUID));
  }

  public async listAllSessions(): Promise<Session[]> {
    if (this.token === undefined) {
      throw new Error(
        `authenticate() must be run prior to calling this function.`
      );
    }

    return this.#rateLimited(() => listAllSessions(this.token!));
  }

  public async retrieveSpecificSession(sessionID: number): Promise<Session> {
    if (this.token === undefined) {
      throw new Error(
        `authenticate() must be run prior to calling this function.`
      );
    }

    return this.#rateLimited(() => retrieveSpecificSession(this.token!, sessionID));
  }

  public async retrieveSessionChartData(sessionID: number): Promise<unknown[]> {
    if (this.token === undefined) {
      throw new Error(
        `authenticate() must be run prior to calling this function.`
      );
    }

    return this.#rateLimited(() => retrieveSessionChartData(this.token!, sessionID));
  }
}