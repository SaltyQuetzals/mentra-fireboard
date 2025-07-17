export interface Device {
  uuid: string;
  id: number;
  title: string;
  hardware_id: string;
  created: Date;
  latest_temps: any[];
  device_log: DeviceLog;
  last_templog: Date;
  channels: Channel[];
}

export interface Channel {
  color_hex: string;
  state: boolean;
  enabled: boolean;
  sessionid: number;
  alerts: any[];
  color_id: number;
  channel: number;
  id: number;
  channel_label: string;
  created: Date;
}

export interface DeviceLog {
  vBatt: number;
  linkquality: string;
  bleClientMAC: string;
  model: string;
  internalIP: string;
  publicIP: string;
  onboardTemp: number;
  auxPort: string;
  cpuUsage: string;
  timeZoneBT: string;
  yfbProbeType: string;
  bleSignalLevel: number;
  tempFilter: string;
  txpower: number;
  versionImage: string;
  boardID: string;
  vBattPer: number;
  signallevel: number;
  drivesettings: string;
  frequency: string;
  contrast: string;
  macNIC: string;
  memUsage: string;
  yfbModel: string;
  uptime: string;
  vBattPerRaw: number;
  version: string;
  ssid: string;
  fwd: string;
  versionEspHal: string;
  commercialMode: string;
  versionNode: string;
  versionUtils: string;
  yfbPower: boolean;
  versionJava: string;
  deviceID: string;
  date: string;
  band: string;
  macAP: string;
  diskUsage: string;
  mode: string;
  yfbVersion: string;
}

export interface LastDrivelog {
  var3: number;
  pg_step_position: number;
  degreetype: number;
  currenttemp: number;
  pg_step_index: null;
  device_id: number;
  tiedchannel: number;
  var1: number;
  pg_uuid: null;
  vbatt: number;
  tieddevice: string;
  pg_elapsed: number;
  created: Date;
  jsonraw: string;
  userinitiated: boolean;
  var2: number;
  id: number;
  powermode: number;
  pg_step_uuid: null;
  modetype: number;
  drivetype: number;
  pg_state: number;
  profiletype: number;
  setpoint: number;
  driveper: number;
}

export interface Session {
  last_active: Date;
  device_ids: string[];
  can_manage: boolean;
  end_time: Date;
  share_visibility: null;
  shared: boolean;
  id: number;
  drive: boolean;
  share_remarks: null;
  start_time: Date;
  description: string;
  duration: string;
  devices: Device[];
  title: string;
  owner: Owner;
  created: Date;
}

export interface Device {
  uuid: string;
  id: number;
  title: string;
  created: Date;
  hardware_id: string;
  channels: Channel[];
  channel_count: number;
  model: string;
  active: boolean;
  auto_session: boolean;
  last_drivelog: LastDrivelog;
}

export interface Channel {
  color_hex: string;
  state: boolean;
  enabled: boolean;
  sessionid: number;
  alerts: any[];
  color_id: number;
  channel: number;
  id: number;
  channel_label: string;
  created: Date;
}

export interface Owner {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  id: number;
  userprofile: UserProfile;
}

export interface UserProfile {
  company: string;
  alert_sms: string;
  alert_emails: string;
  notification_tone: string;
  user: number;
  picture: string;
  last_templog: Date;
  commercial_user: boolean;
  beta: boolean;
  feedback_request: string;
  tos: boolean;
}

export interface ChartData {
  degreetype: number;
  x: number[];
  device: string;
  y: number[];
  enabled: boolean;
  label: string;
  color: string;
  channel_id: number;
}
