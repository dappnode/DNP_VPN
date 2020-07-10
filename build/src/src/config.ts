import { VpnStatus } from "./types";

export const config: {
  hostname?: string;
  internalIp?: string;
} = {};

export const vpnStatus: VpnStatus = { status: "STARTED" };
