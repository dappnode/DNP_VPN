import { shell } from "../utils/shell";
import fs from "fs";

const revokeCommand = "/usr/local/bin/ovpn_revokeclient";

/**
 * @param id "new-device"
 */
export async function removeClient(id: string): Promise<void> {
  try {
    // Revoke first to save in CRL
    await shell(`${revokeCommand} ${id}`);
    for (const file of [
      `${process.env.OPENVPN}/pki/private/${id}.key`,
      `${process.env.OPENVPN}/pki/reqs/${id}.req`,
      `${process.env.OPENVPN}/pki/issued/${id}.crt`
    ])
      fs.unlinkSync(file);
  } catch (err) {
    throw Error(`Error removing device ${id}: ${err.message}`);
  }
}
