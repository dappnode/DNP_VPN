import net from "net";
import { logs } from "../logs";
import {
  dappmanagerApiUrlGlobalEnvs,
  GLOBAL_ENVS,
  GLOBAL_ENVS_KEYS
} from "../params";
import { config } from "../config";
import { fetchText } from "../utils/fetch";

export async function getInternalIpCached(): Promise<string> {
  // internal IP is an optional feature for when NAT-Loopback is off

  const envInternalIp = process.env[GLOBAL_ENVS.INTERNAL_IP];

  if (envInternalIp && net.isIPv4(envInternalIp)) {
    logs.info(`Using internal IP from ENV: ${envInternalIp}`);

    config.internalIp = envInternalIp;
    return envInternalIp;
  }

  const url = `${dappmanagerApiUrlGlobalEnvs}/${GLOBAL_ENVS_KEYS.INTERNAL_IP}`;
  logs.info(`Fetching internal IP from DAPPMANAGER: ${url}`);

  try {
    const internalIp = (await fetchText(url)).trim();

    if (!net.isIPv4(internalIp))
      throw Error(`Invalid internalIp returned: ${internalIp}`);

    config.internalIp = internalIp;

    return internalIp;
  } catch (e) {
    logs.warn("Error getting internal IP from DAPPMANAGER", e as Error);

    if (!config.internalIp) throw e;
    return config.internalIp;
  }
}
