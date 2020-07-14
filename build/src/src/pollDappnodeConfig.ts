import got from "got";
import ip from "ip";
import {
  dappmanagerApiUrlGlobalEnvs,
  GLOBAL_ENVS_KEYS,
  GLOBAL_ENVS
} from "./params";
import { isDomain } from "./utils/domain";
import { logs } from "./logs";

/**
 * Polls the DAPPMANAGER to get the necessary config variables to start
 * the VPN config. If available, fetches the ENVs from process.env
 * It throws an error after about 15 min of retries. The error should cause
 * the main process to crash and be restarted by it's parent manager (i.e. docker)
 */
export async function pollDappnodeConfig({
  onRetry
}: {
  onRetry: (errorMsg: string, retryCount: number) => void;
}): Promise<{
  hostname: string;
  internalIp: string;
}> {
  // If ENVs are already available, do not poll
  const hostnameFromEnv = process.env[GLOBAL_ENVS.HOSTNAME];
  const internalIpFromEnv = process.env[GLOBAL_ENVS.INTERNAL_IP];
  if (hostnameFromEnv && internalIpFromEnv)
    return { hostname: hostnameFromEnv, internalIp: internalIpFromEnv };

  const hostname = await got(GLOBAL_ENVS_KEYS.HOSTNAME, {
    throwHttpErrors: true,
    prefixUrl: dappmanagerApiUrlGlobalEnvs,
    retry: 10, // Should be about 15 minutes
    hooks: {
      beforeRetry: [
        (_0, error, retryCount = 0): void => {
          const errorMsg = error ? `${error.code} ${error.message}` : "";
          onRetry(errorMsg, retryCount);
        }
      ]
    }
  }).text();

  if (!hostname) throw Error("No hostname returned");
  if (!ip.isV4Format(hostname.trim()) && !isDomain(hostname.trim()))
    throw Error(`Invalid hostname returned: ${hostname}`);

  // internal IP is an optional feature for when NAT-Loopback is off
  try {
    const internalIp = await got(GLOBAL_ENVS_KEYS.INTERNAL_IP, {
      throwHttpErrors: true,
      prefixUrl: dappmanagerApiUrlGlobalEnvs
    }).text();
    return { hostname, internalIp };
  } catch (e) {
    logs.warn(`Error getting internal IP from DAPPMANAGER`, e);
    return { hostname, internalIp: "" };
  }
}
