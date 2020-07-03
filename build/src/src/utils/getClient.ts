import { shell } from "../utils/shell";

const fetchCredsCommand = "/usr/local/bin/ovpn_getclient";

/**
 * Returns the .ovpn file of an existing client in plain text
 * @param id "new-device"
 */
export async function getClient(id: string): Promise<string> {
  try {
    return await shell(`${fetchCredsCommand} ${id}`);
  } catch (err) {
    throw Error(`Error retrieving client ${id}: ${err.message}`);
  }
}
