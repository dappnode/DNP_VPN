import { vpnStatus } from "../config";
import { VpnStatus } from "../types";

/**
 * Returns the current status of the VPN server
 * See vpnStatus type for more info
 */
export const getStatus = async (): Promise<VpnStatus> => vpnStatus;
