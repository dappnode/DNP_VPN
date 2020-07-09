import { getClient } from "../openvpn";
import { encrypt, generateKey } from "../utils/encrypt";
import { VpnDeviceCredentials } from "../types";
import { CRED_PORT } from "../params";
import { config } from "../config";
import { writeCredFile } from "../openvpn/credentialsFile";

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
  const hostname = config.hostname;
  if (!hostname) throw Error("hostname not set");

  const key = generateKey();
  const credentialsFileData = await getClient(id);
  const encryptedCredentials = encrypt(credentialsFileData, key);

  const { filename } = writeCredFile(id, encryptedCredentials);

  const encodedKey = encodeURIComponent(key);
  const url = `http://${hostname}:${CRED_PORT}/?id=${filename}#${encodedKey}`;

  return {
    filename,
    key,
    url
  };
}
