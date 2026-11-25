import { shell } from "../utils/shell";

// bash-4.4# ovpn_listclients
// name,begin,end,status
// dappnode_admin,Nov 21 14:00:04 2018 GMT,Nov 18 14:00:04 2028 GMT,VALID
// luser,Nov 23 14:00:49 2018 GMT,Nov 20 14:00:49 2028 GMT,VALID
// revoked,Nov 23 14:02:38 2018 GMT,Nov 20 14:02:38 2028 GMT,REVOKED

const ovpnListCommand = "/usr/local/bin/ovpn_listclients";

/**
 * Returns the list of current user ids
 * @returns ["dappnode_admin", "luser", "revoked"]
 */
export async function getUserList(): Promise<string[]> {
  const output = await shell(ovpnListCommand);
  // Select users from first field.
  return output
    .split("\n")
    .filter(line => line && !line.startsWith("name,"))
    .map(line => line.split(",")[0]);
}

/**
 * Throws if `id` is not an existing device.
 * The PKI also holds the CA and server keys under the same directories,
 * so commands that take a device id must only run for listed devices.
 */
export async function assertDeviceExists(id: string): Promise<void> {
  const users = await getUserList();
  if (!users.includes(id)) throw Error(`Device name not found: ${id}`);
}
