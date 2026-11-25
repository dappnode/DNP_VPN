import fs from "fs";
import path from "path";
import { deleteTokenForId } from "../credentials";
import { shell } from "../utils/shell";
import { assertValidDeviceId } from "../utils/deviceId";
import { OPENVPN } from "../params";

const revokeCommand = "/usr/local/bin/ovpn_revokeclient";

/**
 * @param id "new-device"
 */
export async function removeClient(id: string): Promise<void> {
  assertValidDeviceId(id);
  try {
    // Revoke first to save in CRL
    await shell(revokeCommand, [id]);

    // Current easy-rsa already moves these files to pki/revoked/ on revoke,
    // older versions left them in place. Remove them if still present so
    // the same device name can be issued again.
    const pkiDir = path.join(process.env.OPENVPN || OPENVPN, "pki");
    for (const file of [
      path.join(pkiDir, "private", `${id}.key`),
      path.join(pkiDir, "reqs", `${id}.req`),
      path.join(pkiDir, "issued", `${id}.crt`)
    ])
      if (fs.existsSync(file)) fs.unlinkSync(file);

    deleteTokenForId(id);
  } catch (err) {
    throw Error(`Error removing device ${id}: ${err.message}`);
  }
}
