import fs from "fs";
import path from "path";
import { getClient } from "../openvpn";
import { encrypt, generateKey } from "../utils/encrypt";
import { VpnDeviceCredentials } from "../types";
import { SALT_PATH, OPENVPN_CRED_DIR, CRED_PORT } from "../params";
import { sha256 } from "../utils/crypto";
import { config } from "../config";

/**
 * Creates a new OpenVPN credentials file, encrypted.
 * The filename is the (16 chars short) result of hashing the generated salt in the db,
 * concatenated with the device id.
 * @param id "new-device"
 */
export async function getDeviceCredentials({
  id
}: {
  id: string;
}): Promise<VpnDeviceCredentials> {
  const key = generateKey();

  const credentialsFileData = await getClient(id);
  const encryptedCredentials = encrypt(credentialsFileData, key);

  const salt = fs.readFileSync(SALT_PATH, "utf-8");
  const hostname = config.hostname;

  if (!salt) throw Error("Salt not set");
  if (!hostname) throw Error("hostname not set");

  const filename = sha256(salt + id).slice(0, 16);
  fs.writeFileSync(path.join(OPENVPN_CRED_DIR, filename), encryptedCredentials);

  const encodedKey = encodeURIComponent(key);
  const url = `http://${hostname}:${CRED_PORT}/?id=${filename}#${encodedKey}`;

  return {
    filename,
    key,
    url
  };
}
