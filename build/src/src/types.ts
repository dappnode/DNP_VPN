export type RpcResult<R> =
  | { success: true; result: R }
  | { success: false; message: string };

export type Args = any[];
export type Result = any | void;

export interface LoggerMiddleware {
  onCall?: (route: string, args?: Args) => void;
  onSuccess?: (route: string, result: Result, args?: Args) => void;
  onError?: (route: string, error: Error, args?: Args) => void;
}

export interface VersionData {
  version: "0.1.21";
  branch: "master";
  commit: "ab991e1482b44065ee4d6f38741bd89aeaeb3cec";
}

export interface VpnDevice {
  id: string;
  admin: boolean;
  ip: string;
}

export interface VpnDeviceCredentials {
  filename: string;
  key: string;
  url: string;
}

export interface OpenVpnCCDItem {
  cn: string;
  ip: string;
}
