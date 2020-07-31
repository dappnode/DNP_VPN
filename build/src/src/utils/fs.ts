import fs from "fs";

/**
 * Checks if a directory is empty, or not existent or not a directory
 * @param dirPath
 */
export function directoryIsEmptyOrEnoent(dirPath: string): boolean {
  try {
    const files = fs.readdirSync(dirPath);
    return files.length === 0;
  } catch (e) {
    if (e.code === "ENOENT" || e.code === "ENOTDIR") return true;
    throw e;
  }
}
