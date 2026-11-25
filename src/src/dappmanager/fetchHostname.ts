import net from "net";
import retry from "async-retry";
import {
  dappmanagerApiUrlGlobalEnvs,
  GLOBAL_ENVS_KEYS,
  GLOBAL_ENVS,
  NO_HOSTNAME_RETURNED_ERROR
} from "../params";
import { isDomain } from "../utils/domain";
import { fetchText } from "../utils/fetch";
import { logs } from "../logs";

/**
 * Polls the DAPPMANAGER to get the HOSTNAME (domain or IP) necessary to start
 * the VPN config. If available, fetches the ENVs from process.env
 * It throws an error after about 15 min of retries. The error should cause
 * the main process to crash and be restarted by it's parent manager (i.e. docker)
 */
export async function fetchHostname({
  onRetry
}: {
  onRetry: (errorMsg: string, retryCount: number) => void;
}): Promise<string> {
  // If ENVs are already available, do not poll
  const hostNameFromEnv = process.env[GLOBAL_ENVS.HOSTNAME];

  if (hostNameFromEnv) {
    logs.info(`Using hostname from ENV: ${hostNameFromEnv}`);
    return hostNameFromEnv;
  }

  const url = `${dappmanagerApiUrlGlobalEnvs}/${GLOBAL_ENVS_KEYS.HOSTNAME}`;
  logs.info(`Fetching hostname from DAPPMANAGER: ${url}`);

  // Retries both network / HTTP errors and a 200 response with an empty hostname
  // 10 retries with exponential backoff (1s, 2s, 4s, ...) is about 15 minutes
  return await retry(
    async () => {
      const data = (await fetchText(url)).trim();
      if (!data) throw Error(NO_HOSTNAME_RETURNED_ERROR);
      if (!net.isIPv4(data) && !isDomain(data))
        throw Error(`Invalid hostname returned: ${data}`);
      return data;
    },
    {
      retries: 10,
      onRetry: (e, retryCount) => {
        onRetry((e as Error).message, retryCount);
      }
    }
  );

  // internal IP not fetched here, it is an optional feature
  // for when NAT-Loopback is off
}
