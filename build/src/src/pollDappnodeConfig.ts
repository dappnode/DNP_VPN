import got from "got";
import ip from "ip";
import retry from "async-retry";
import {
  dappmanagerApiUrlGlobalEnvs,
  GLOBAL_ENVS_KEYS,
  GLOBAL_ENVS,
  NO_HOSTNAME_RETURNED_ERROR
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
  // If ENVs are already available, do not poll (only for hostname?)
  const hostname =
    process.env[GLOBAL_ENVS.HOSTNAME] || (await getHostname({ onRetry }));
  const internalIp = await getInternalIp();

  return { hostname: hostname, internalIp: internalIp };
}

async function getHostname({
  onRetry
}: {
  onRetry: (errorMsg: string, retryCount: number) => void;
}) {
  // Add async-retry in case the DAPPMANAGER returns an 200 code with empty hostname
  const hostname = await retry(
    () =>
      got(GLOBAL_ENVS_KEYS.HOSTNAME, {
        throwHttpErrors: true,
        prefixUrl: dappmanagerApiUrlGlobalEnvs,
        retry: 10, // Should be about 15 minutes
        hooks: {
          beforeRetry: [
            (_0, e, retryCount = 0): void => {
              onRetry(e ? `${e.code} ${e.message}` : "", retryCount);
            }
          ]
        }
      })
        .text()
        .then(res => res.trim())
        .then(data => {
          if (!data) throw Error(NO_HOSTNAME_RETURNED_ERROR);
          if (!ip.isV4Format(data) && !isDomain(data))
            throw Error(`Invalid hostname returned: ${data}`);
          return data;
        }),
    {
      retries: 10,
      onRetry: (e, retryCount) => {
        onRetry(e.message, retryCount);
      }
    }
  );
  return hostname;
}

async function getInternalIp() {
  // internal IP is an optional feature for when NAT-Loopback is off
  try {
    const internalIp = await got(GLOBAL_ENVS_KEYS.INTERNAL_IP, {
      throwHttpErrors: true,
      prefixUrl: dappmanagerApiUrlGlobalEnvs
    })
      .text()
      .then(res => res.trim());

    return internalIp;
  } catch (e) {
    logs.warn(`Error getting internal IP from DAPPMANAGER`, e);
    // InternalIp=""
    return "";
  }
}
