import ip from "ip";
import got from "got";
import { logs } from "../logs";
import { GLOBAL_ENVS, dappmanagerApiUrlGlobalEnvs } from "../params";
import { config } from "../config";

export async function getInternalIpCached(): Promise<string> {
  // internal IP is an optional feature for when NAT-Loopback is off
  try {

    const envInternalIp = process.env[GLOBAL_ENVS.INTERNAL_IP];

    if (envInternalIp && ip.isV4Format(envInternalIp)) {

      logs.info(`Using internal IP from ENV: ${envInternalIp}`);

      config.internalIp = envInternalIp;
      return envInternalIp;
    }

    logs.info(`Fetching internal IP from DAPPMANAGER: ${dappmanagerApiUrlGlobalEnvs}`);

    const internalIp = await got(GLOBAL_ENVS.INTERNAL_IP, {
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
