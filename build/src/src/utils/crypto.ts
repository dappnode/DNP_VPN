import crypto from "crypto";

/**
 * Returns the hash digest of NodeJS native crypto module's sha256
 * @param data
 */
export function sha256(data: string): string {
  return crypto
    .createHash("sha256")
    .update(data)
    .digest("hex");
}
