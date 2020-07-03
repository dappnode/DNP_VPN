import crypto from "crypto";
import fs from "fs";
import { getClient } from "../utils/getClient";
import { encrypt, generateKey } from "../utils/encrypt";
import { VpnDeviceCredentials } from "../types";
import {
  saltPath,
  GLOBAL_ENVS,
  credentialsDir,
  credentialsPort
} from "../params";

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
  const encrypted = encrypt(credentialsFileData, key);

  const salt = fs.readFileSync(saltPath, "utf-8");
  const hostname = process.env[GLOBAL_ENVS.HOSTNAME];

  if (!salt) throw Error("Salt not present.");

  const filename = crypto
    .createHash("sha256")
    .update(salt + id)
    .digest("hex")
    .substring(0, 16);
  fs.writeFileSync(`${credentialsDir}/${filename}`, encrypted);
  const url = `http://${hostname}:${credentialsPort}/?id=${filename}#${encodeURIComponent(
    key
  )}`;

  return {
    filename,
    key,
    url
  };
}
