import type { ChartData, Device, Session } from "./api_types";

const FIREBOARD_API_URL = "https://fireboard.io/api";

interface APIError {
  non_field_errors?: string[];
  detail?: string;
}

const raiseIfError = async (response: Response) => {
  if (response.ok) {
    return;
  }
  const apiError: APIError = await response.json();
  if (apiError.detail !== undefined) {
    throw new Error(apiError.detail);
  } else if (apiError.non_field_errors !== undefined) {
    console.error(apiError);
    throw new Error(apiError.non_field_errors.join(", "));
  }
};

export const retrieveAuthenticationToken = async (
  username: string,
  password: string
): Promise<string> => {
  const response = await fetch(`${FIREBOARD_API_URL}/rest-auth/login/`, {
    method: "POST",
    body: JSON.stringify({
      username,
      password,
    }),
    headers: {
      "User-Agent": "Test",
      "Content-Type": "application/json",
    },
  });

  await raiseIfError(response);

  const body: { key: string } = await response.json();

  return body.key;
};

export const listAllDevices = async (token: string): Promise<Device[]> => {
  const url = `${FIREBOARD_API_URL}/v1/devices.json`;
  console.log('url =', url);
  const response = await fetch(url, {
    headers: new Headers({
      Authorization: `Token ${token}`,
    }),
  });

  await raiseIfError(response);

  console.log(response.status);

  const allDevices = await response.json();
  return allDevices;
};

export const retrieveSpecificDevice = async (
  token: string,
  deviceUUID: string
): Promise<Device> => {
  const response = await fetch(
    `${FIREBOARD_API_URL}/v1/devices/${deviceUUID}.json`,
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  );

  await raiseIfError(response);

  const device: Device = await response.json();
  return device;
};

export const retrieveRealtimeTemperatureOfDevice = async (token: string, deviceUUID: string): Promise<unknown[]> => {
  const response = await fetch(
    `${FIREBOARD_API_URL}/v1/devices/${deviceUUID}/temps.json`,
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  )

  await raiseIfError(response);

  return response.json();
}

export const retrieveRealtimeDriveDataOfDevice = async (token: string, deviceUUID: string): Promise<unknown[]> => {
  const response = await fetch(
    `${FIREBOARD_API_URL}/v1/devices/${deviceUUID}/drivelog.json`,
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  )

  await raiseIfError(response);

  return response.json();
}

export const listAllSessions = async (token: string): Promise<Session[]> => {
  const response = await fetch(
    `${FIREBOARD_API_URL}/v1/sessions.json`,
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  )

  await raiseIfError(response);

  return response.json();
}

export const retrieveSpecificSession = async (token: string, sessionID: number): Promise<Session> => {
  const response = await fetch(
    `${FIREBOARD_API_URL}/v1/sessions/${sessionID}.json`,
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  )

  await raiseIfError(response);

  return response.json();
}

export const retrieveSessionChartData = async (token: string, sessionID: number): Promise<ChartData[]> => {
  const response = await fetch(
    `${FIREBOARD_API_URL}/v1/sessions/${sessionID}/chart.json`,
    {
      headers: {
        Authorization: `Token ${token}`,
      },
    }
  )

  await raiseIfError(response);

  return response.json();
}