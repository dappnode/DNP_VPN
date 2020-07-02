import { shell } from "../utils/shell";

const fetchCredsCommand = "/usr/local/bin/ovpn_getclient";

export async function getClient(id: string) {
  try {
    return await shell(`${fetchCredsCommand} ${id}`);
  } catch (err) {
    throw Error(`Error retrieving client ${id}: ${err.message}`);
  }
}
