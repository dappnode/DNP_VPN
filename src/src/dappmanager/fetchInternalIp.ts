import ip from "ip";
import got from "got";
import { logs } from "../logs";
import { dappmanagerApiUrlGlobalEnvs, GLOBAL_ENVS_KEYS } from "../params";
import { config } from "../config";

export async function getInternalIpCached(): Promise<string> {
  // internal IP is an optional feature for when NAT-Loopback is off

  const envInternalIp = process.env[GLOBAL_ENVS_KEYS.INTERNAL_IP];

  if (envInternalIp && ip.isV4Format(envInternalIp)) {

    logs.info(`Using internal IP from ENV: ${envInternalIp}`);

    config.internalIp = envInternalIp;
    return envInternalIp;
  }

  logs.info(`Fetching internal IP from DAPPMANAGER: ${dappmanagerApiUrlGlobalEnvs}`);

  try {

    const internalIp = await got(GLOBAL_ENVS_KEYS.INTERNAL_IP, {
      throwHttpErrors: true,
      prefixUrl: dappmanagerApiUrlGlobalEnvs
    })
      .text()
      .then(res => res.trim());

    if (!ip.isV4Format(internalIp))
      throw Error(`Invalid internalIp returned: ${internalIp}`);

    config.internalIp = internalIp;

    return internalIp;
  } catch (e) {
    logs.warn("Error getting internal IP from DAPPMANAGER", e);

    if (!config.internalIp) throw e;
    return config.internalIp;
  }
}
