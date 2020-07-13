import { VpnStatus } from "./types";

/**
 * In memory "db" of config values shared between components
 * hostname and internalIp are fetched from the DAPPMANAGER at init
 * and used latter when generating link to get cred files
 */
export const config: {
  hostname?: string;
  internalIp?: string;
} = {};

export const vpnStatus: VpnStatus = { status: "STARTED" };
