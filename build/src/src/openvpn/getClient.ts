import got from "got/dist/source";
import { logs } from "../logs";
import {
  dappmanagerApiUrlGlobalEnvs,
  GLOBAL_ENVS,
  GLOBAL_ENVS_KEYS
} from "../params";
import { shell } from "../utils/shell";

const fetchCredsCommand = "/usr/local/bin/ovpn_getclient";

/**
 * Returns the .ovpn file of an existing client in plain text
 * @param id "new-device"
 */
export async function getClient(id: string): Promise<string> {
  try {
    return await shell(`${fetchCredsCommand} ${id}`, {
      env: { DAPPNODE_INTERNAL_IP: await getInternalIp() }
    });
  } catch (err) {
    throw Error(`Error retrieving client ${id}: ${err.message}`);
  }
}

async function getInternalIp(): Promise<string> {
  // internal IP is an optional feature for when NAT-Loopback is off
  try {
    return await got(GLOBAL_ENVS_KEYS.INTERNAL_IP, {
      throwHttpErrors: true,
      prefixUrl: dappmanagerApiUrlGlobalEnvs
    })
      .text()
      .then(res => res.trim());
  } catch (e) {
    logs.warn(`Error getting internal IP from DAPPMANAGER`, e);
    return process.env[GLOBAL_ENVS.INTERNAL_IP] || "";
  }
}
