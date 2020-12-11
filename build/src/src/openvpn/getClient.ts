import { GLOBAL_ENVS } from "../params";
import { shell } from "../utils/shell";

const fetchCredsCommand = "/usr/local/bin/ovpn_getclient";

/**
 * Returns the .ovpn file of an existing client in plain text
 * @param id "new-device"
 */
export async function getClient(id: string): Promise<string> {
  try {
    return await shell(`${fetchCredsCommand} ${id}`, {
      env: { DAPPNODE_INTERNAL_IP: process.env[GLOBAL_ENVS.INTERNAL_IP] }
    });
  } catch (err) {
    throw Error(`Error retrieving client ${id}: ${err.message}`);
  }
}
