import fs from "fs";
import { logs } from "../logs";
import { VersionData } from "../types";

// Cache git data to only read it once from disk
let gitData: VersionData;

export function getGitData(): VersionData {
  if (!gitData) {
    if (!process.env.GIT_DATA_PATH) throw Error("GIT_DATA_PATH not set");
    gitData = JSON.parse(fs.readFileSync(process.env.GIT_DATA_PATH, "utf8"));
  }
  return gitData;
}

/**
 * For debugging, print current version, branch and commit
 * { "version": "0.1.21",
 *   "branch": "master",
 *   "commit": "ab991e1482b44065ee4d6f38741bd89aeaeb3cec" }
 * SAFE: Wrapped in try / catch
 */
export function printGitData(): void {
  try {
    logs.info("Version info", getGitData());
  } catch (e) {
    logs.error("Error reading gitDataPath", e);
  }
}
