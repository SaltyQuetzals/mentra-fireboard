import { AppServer, AppSession, AuthenticatedRequest } from '@mentra/sdk';
import express from 'express';
import path from 'path';
import { retrieveAuthenticationToken } from './fireboard/api';
import { FireboardClient } from './fireboard/fireboard_client';
import { Device } from './fireboard/api_types';
import { readFile } from 'fs/promises';
import EventEmitter from 'events';

// Load configuration from environment variables
const PACKAGE_NAME = process.env.PACKAGE_NAME ?? (() => { throw new Error('PACKAGE_NAME is not set in .env file'); })();
const MENTRAOS_API_KEY = process.env.MENTRAOS_API_KEY ?? (() => { throw new Error('MENTRAOS_API_KEY is not set in .env file'); })();
const PORT = parseInt(process.env.PORT || '3000');

class FireboardMentraOSApp extends AppServer {
  /**
   * Keys = MentraOS User IDs
   * Values = Fireboard API Keys
   */
  private apiKeyCache: Map<string, string> = new Map();

  private appSessions: Map<string, { fireboard: FireboardClient, timer: NodeJS.Timeout, session: AppSession }>;

  private emitter: EventEmitter;

  constructor() {
    super({
      packageName: PACKAGE_NAME,
      apiKey: MENTRAOS_API_KEY,
      port: PORT,
    });

    this.setupRoutes();
    this.emitter = new EventEmitter();
    this.appSessions = new Map();
    this.emitter.addListener('temp_update', this.handleTempUpdate);
    this.addCleanupHandler(this.onCleanup);
  }

  private onCleanup() {
    this.emitter.removeListener('temp_update', this.handleTempUpdate);
  }

  /**
   * Set up Express routes for the application
   */
  private setupRoutes(): void {
    const app = this.getExpressApp();

    // Serve static files in production
    if (process.env.NODE_ENV === 'production') {
      app.use(express.static(path.join(__dirname, '../dist/frontend')));
    }

    // Health check endpoint
    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', timestamp: Date.now() });
    });

    app.get('/api/login', (req: AuthenticatedRequest, res) => {
      const userId = req.authUserId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      res.json({ authenticated: this.apiKeyCache.has(userId) })
    })

    app.post('/api/login', (req: AuthenticatedRequest, res) => {
      const userId = req.authUserId;

      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      retrieveAuthenticationToken(req.body.username, req.body.password).then((apiToken) => {
        this.apiKeyCache.set(userId, apiToken);
        res.sendStatus(200);
      }).catch((err) => {
        res.status(400).json({ error: err });
      });
    })

    // Catch-all route for React app (in production)
    if (process.env.NODE_ENV === 'production') {
      app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist/frontend/index.html'));
      });
    }
  }

  /**
   * Handle new MentraOS sessions
   * @param session - The app session instance
   * @param sessionId - Unique session identifier
   * @param userId - User identifier
   */
  protected async onSession(session: AppSession, sessionId: string, userId: string): Promise<void> {
    console.log(`New session: ${sessionId} for user ${userId}`);

    if (!this.apiKeyCache.has(userId)) {
      session.layouts.showTextWall("You must authenticate with Fireboard before you can use this app. Please log in via the webview, and then restart this app.")
      return;
    }

    const fireboard = new FireboardClient({ token: this.apiKeyCache.get(userId)! });
    await fireboard.authenticate();
    session.layouts.showTextWall('Fetching active Fireboard devices...');
    const devices = await fireboard.listAllDevices();
    const timer = await this.#pollActiveDevicesDummy(sessionId, fireboard, []);
    this.appSessions.set(sessionId, { fireboard, timer, session })

    // Handle session disconnect
    session.events.onDisconnected(() => {
      const session = this.appSessions.get(sessionId);
      clearInterval(session?.timer);
      this.appSessions.delete(sessionId);
    });
  }

  private handleTempUpdate = (data: { mentraSessionId: string, payload: { label: string, temp: number }[] }) => {
    const mentraSession = this.appSessions.get(data.mentraSessionId);
    if (mentraSession === undefined) {
      console.warn(`Attempted to lookup ${data.mentraSessionId} in app sessions, but no session was found. Uncleared interval?`);
      return;
    }
    const displayString = this.constructDisplayString(data.payload)
    mentraSession.session.layouts.showTextWall(displayString);
  }


  private constructDisplayString = (payload: { label: string, temp: number }[]): string => {
    // Display the label as keys and the temp as values in a columnar format
    // Example:
    // Pit: 225.0°F
    // Probe 2: 180.2°F
    // etc.
    if (!payload || payload.length === 0) {
      return "No temperature data available.";
    }
    // Format each line as "Label: temp°F" (rounded to 1 decimal)
    return payload
      .map(({ label, temp }) => {
        // If temp is undefined or null, show as "--"
        const tempStr = (typeof temp === "number" && !isNaN(temp)) ? `${temp.toFixed(1)}°F` : "--";
        return `${label}: ${tempStr}`;
      })
      .join('\n');
  }


  // async #listActiveDevices(fireboard: FireboardClient) {
  //   const devices = await fireboard.listAllDevices();
  //   return devices.filter((device) => device.latest_temps && device.latest_temps.length > 0);
  // }

  // #pollActiveDevices = async (fireboard: FireboardClient, devices: Device[]) =>
  //   setInterval(() => {
  //     const promises = devices.map((device) => fireboard.retrieveRealtimeTemperatureOfDevice(device.uuid));
  //     try {
  //       Promise.allSettled(promises).then((results) => {
  //         for (const result of results) {
  //           if (result.status === 'rejected') {
  //             continue;
  //           }
  //           console.log(result.value);
  //         }
  //       })
  //     }
  //     catch (err) {
  //       console.log(err);
  //     }
  //   });

  #pollActiveDevicesDummy = async (mentraSessionId: string, fireboard: FireboardClient, devices: Device[]) => {
    type DummyChannel = {
      label: string;
      x: number[];
      device: string;
      degreetype: number;
      color: string;
      channel_id: number;
      y: number[];
      enabled: boolean;
    };

    /**
     * Performs a binary search to find the largest index in a sorted array of numbers
     * whose value is less than or equal to the provided value.
     * Returns -1 if all elements are greater than the value.
     */
    function binarySearchLE(arr: number[], value: number): number {
      let left = 0;
      let right = arr.length - 1;
      let result = -1;
      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] <= value) {
          result = mid;
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }
      return result;
    }

    const file = await readFile('session_9366593.json', { encoding: 'utf-8' });
    const channelsFromFile: DummyChannel[] = JSON.parse(file);
    const minX = Math.min(...channelsFromFile.map((channel) => channel.x[0]));

    const channels: DummyChannel[] = channelsFromFile.map((channel) => ({
      ...channel,
      x: channel.x.map((x) => (x - minX) + Date.now())
    }))


    return setInterval(() => {
      const payload = channels.map((channel) => {
        const index = binarySearchLE(channel.x, Date.now());
        return { label: channel.label, temp: channel.y[index] };
      });

      this.emitter.emit('temp_update', { mentraSessionId, payload })
    }, 5_000)
  }
}

// Start the server
const app = new FireboardMentraOSApp();

app.start().catch(console.error);