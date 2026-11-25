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
    const code = (e as NodeJS.ErrnoException).code;
    if (code === "ENOENT" || code === "ENOTDIR") return true;
    throw e;
  }
}
