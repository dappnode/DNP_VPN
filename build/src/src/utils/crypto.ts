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

/**
 * Random token of 32 bytes in hex using crypto.randomBytes
 */
export function getRandomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}
