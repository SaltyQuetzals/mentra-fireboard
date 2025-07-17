import {
  expect,
  test,
  describe,
  spyOn,
  mock,
  beforeEach,
  afterAll,
  afterEach,
} from "bun:test";
import { FireboardClient } from "./fireboard_client";

const spyFetch = spyOn(globalThis, "fetch");

describe("Client", () => {
  describe("constructor", () => {
    test("accepts username and password", () => {
      const client = new FireboardClient({ username: "username", password: "password" });
    });

    test("accepts api token", () => {
      const client = new FireboardClient({ token: "token" });
    });

    test("fails if username/password are provided, and token is provided", () => {
      expect(() => {
        new FireboardClient({
          username: "username",
          password: "password",
          token: "token",
        });
      }).toThrowError(
        "Please provide either a username/password or an API token, but not both."
      );
      expect(() => {
        new FireboardClient({
          username: undefined,
          password: "password",
          token: "token",
        });
      }).toThrowError(
        "Please provide either a username/password or an API token, but not both."
      );
      expect(() => {
        new FireboardClient({
          username: "username",
          password: undefined,
          token: "token",
        });
      }).toThrowError(
        "Please provide either a username/password or an API token, but not both."
      );
    });

    test("fails if just username or password are provided.", () => {
      expect(() => {
        new FireboardClient({ username: "username" });
      }).toThrowError("Missing username/password.");
      expect(() => {
        new FireboardClient({ password: "password" });
      }).toThrowError("Missing username/password.");
    });
  });

  describe("authenticate", () => {
    test("warns the user if attempting to authenticate when a token already exists", async () => {
      const spy = spyOn(console, "warn");
      const expectedToken = "token";
      const client = new FireboardClient({ token: expectedToken });
      await client.authenticate();
      expect(spy).toHaveBeenCalledWith(
        "An authentication token has already been provided. Using that instead of requesting a new one."
      );
    });

    test("raises error with unknown credentials", async () => {
      const client = new FireboardClient({ username: "username", password: "password" });
      const mockAuthenticate: any = async (url: string, options: any) => {
        return {
          ok: false,
          json: async () => {
            return {
              non_field_errors: ["Unable to log in with provided credentials."],
            };
          },
        };
      };
      spyFetch.mockImplementationOnce(mockAuthenticate);
      expect(async () => {
        await client.authenticate();
      }).toThrowError("Unable to log in with provided credentials.");
    });

    test("authenticates successfully", async () => {
      // Taken from example in FireBoard Cloud API docs
      const expectedKey = "9944bb9966cc22cc9418ad846dd0e4bbdfc6ee4b";
      const mockAuthenticate: any = async (url: string, options: any) => {
        return {
          ok: true,
          json: async () => {
            return {
              key: expectedKey,
            };
          },
        };
      };

      spyFetch.mockImplementationOnce(mockAuthenticate);

      const client = new FireboardClient({ username: "username", password: "password" });

      await client.authenticate();

      expect((client as any).token).toEqual(expectedKey);
    });
  });

  describe("listAllDevices", () => {
    test("lists all devices properly", async () => {
      const client = new FireboardClient({
        username: process.env.FIREBOARD_USERNAME,
        password: process.env.FIREBOARD_PASSWORD,
      });
      await client.authenticate();
      const devices = await client.listAllDevices();
      console.log(devices);
    });
  });
});
