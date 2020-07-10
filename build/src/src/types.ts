// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Args = any[];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Result = any | void;

export interface RpcResponse {
  result?: Result;
  error?: { code: number; message: string; data?: string };
}

export interface RpcRequest {
  method: string;
  params: Args;
}

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
  url: string;
}

export interface OpenVpnCCDItem {
  cn: string;
  ip: string;
}
