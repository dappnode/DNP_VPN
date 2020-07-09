import fs from "fs";
import path from "path";
import { sha256 } from "../utils/crypto";
import { MASTER_ADMIN_NAME, OPENVPN_CRED_DIR, SALT_PATH } from "../params";

/**
 * @param id "new-device"
 */
function getCredFilePath(id: string): { filename: string; filepath: string } {
  const salt = fs.readFileSync(SALT_PATH, "utf-8");
  const filename = sha256(salt + id).slice(0, 16);
  const filepath = path.join(OPENVPN_CRED_DIR, filename);
  return { filename, filepath };
}

/**
 * @param id "new-device"
 */
export function removeCredFile(id: string): void {
  const { filepath } = getCredFilePath(id);

  try {
    fs.unlinkSync(filepath);
  } catch (e) {
    if (e.code !== "ENOENT") throw e;
  }

  // Reset login text
  if (id === MASTER_ADMIN_NAME) {
    // echo "The admin credentials expired. Use the command below to generate a new download link:" > "$LOGIN_MSG_PATH"
    // echo "dappnode_get ${DEFAULT_ADMIN_USER}" >> "$LOGIN_MSG_PATH"
  }
}

/**
 * @param id "new-device"
 */
export function writeCredFile(
  id: string,
  encryptedCredentials: string
): { filename: string } {
  const { filename, filepath } = getCredFilePath(id);
  fs.writeFileSync(filepath, encryptedCredentials);
  return { filename };
}
