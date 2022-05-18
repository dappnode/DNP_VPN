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
  const users: string[] = [];
  // Select users from first field.
  output
    .toString()
    .split("\n")
    .filter(line => !line.startsWith("name,"))
    .map(element => {
      if (element) users.push(element.split(",")[0]);
    });
  return users;
}
