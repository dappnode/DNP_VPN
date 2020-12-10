import fs from "fs";
import { deleteTokenForId } from "../credentials";
import { shell } from "../utils/shell";
import { MAIN_ADMIN_NAME } from "../params";

const revokeCommand = "/usr/local/bin/ovpn_revokeclient";

/**
 * @param id "new-device"
 */
export async function removeClient(id: string): Promise<void> {
  if (id === MAIN_ADMIN_NAME) {
    throw Error("Cannot remove the main admin user");
  }

  try {
    // Revoke first to save in CRL
    await shell(`${revokeCommand} ${id}`);
    for (const file of [
      `${process.env.OPENVPN}/pki/private/${id}.key`,
      `${process.env.OPENVPN}/pki/reqs/${id}.req`,
      `${process.env.OPENVPN}/pki/issued/${id}.crt`
    ])
      fs.unlinkSync(file);

    deleteTokenForId(id);
  } catch (err) {
    throw Error(`Error removing device ${id}: ${err.message}`);
  }
}
