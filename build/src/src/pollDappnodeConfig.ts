import got from "got";
import { logs } from "./logs";
import {
  dappmanagerApiUrlGlobalEnvs,
  GLOBAL_ENVS_KEYS,
  GLOBAL_ENVS
} from "./params";

/**
 * Polls the DAPPMANAGER to get the necessary config variables to start
 * the VPN config. If available, fetches the ENVs from process.env
 * It throws an error after about 15 min of retries. The error should cause
 * the main process to crash and be restarted by it's parent manager (i.e. docker)
 */
export async function pollDappnodeConfig(): Promise<{
  hostname: string;
  internalIp: string;
}> {
  // If ENVs are already available, do not poll
  const hostnameFromEnv = process.env[GLOBAL_ENVS.HOSTNAME];
  const internalIpFromEnv = process.env[GLOBAL_ENVS.INTERNAL_IP];
  if (hostnameFromEnv && internalIpFromEnv) {
    logs.info("Config parameters available in process ENV");
    return { hostname: hostnameFromEnv, internalIp: internalIpFromEnv };
  }

  logs.info("Polling DAPPMANAGER for config ENVs");
  const hostname = await got(GLOBAL_ENVS_KEYS.HOSTNAME, {
    throwHttpErrors: true,
    prefixUrl: dappmanagerApiUrlGlobalEnvs,
    retry: 10, // Should be about 15 minutes
    hooks: {
      beforeRetry: [
        (_0, error, retryCount = 0) => {
          const errorMessage = error ? `${error.code} ${error.message}` : "";
          logs.info(`retry ${retryCount} - ${errorMessage}`);
        }
      ]
    }
  }).text();
  logs.info(`Config ENV hostname: ${hostname}`);

  const internalIp = await got(GLOBAL_ENVS_KEYS.INTERNAL_IP, {
    throwHttpErrors: true,
    prefixUrl: dappmanagerApiUrlGlobalEnvs
  }).text();
  logs.info(`Config ENV internalIp: ${internalIp}`);

  return { hostname, internalIp };
}
