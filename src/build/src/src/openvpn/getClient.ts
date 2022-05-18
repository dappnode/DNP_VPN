import { getInternalIpCached } from "../dappmanager/fetchInternalIp";
import { shell } from "../utils/shell";

const fetchCredsCommand = "/usr/local/bin/ovpn_getclient";

/**
 * Returns the .ovpn file of an existing client in plain text
 * @param id "new-device"
 */
export async function getClient(id: string): Promise<string> {
  const DAPPNODE_INTERNAL_IP = await getInternalIpCached();

  try {
    return await shell(`${fetchCredsCommand} ${id}`, {
      env: { ...process.env, DAPPNODE_INTERNAL_IP }
    });
  } catch (err) {
    throw Error(`Error retrieving client ${id}: ${err.message}`);
  }
}
