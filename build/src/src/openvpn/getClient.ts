import got from "got/dist/source";
import { env } from "yargs";
import { logs } from "../logs";
import {
  GLOBAL_ENVS_KEYS,
  dappmanagerApiUrlGlobalEnvs,
  GLOBAL_ENVS
} from "../params";
import { shell } from "../utils/shell";

const fetchCredsCommand = "/usr/local/bin/ovpn_getclient";

/**
 * Returns the .ovpn file of an existing client in plain text
 * @param id "new-device"
 */
export async function getClient(id: string): Promise<string> {
  const internalIp = await getInternalIp();
  try {
    return await shell(`${fetchCredsCommand} ${id}`, {
      env: { DAPPNODE_INTERNAL_IP: internalIp }
    });
  } catch (err) {
    throw Error(`Error retrieving client ${id}: ${err.message}`);
  }
}

async function getInternalIp(): Promise<string> {
  const internalIpFromEnv = process.env[GLOBAL_ENVS.INTERNAL_IP];
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
    return internalIpFromEnv || "";
  }
}
