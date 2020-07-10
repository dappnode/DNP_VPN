import fs from "fs";
import { logs } from "../logs";
import { VersionData } from "../types";
import { GIT_DATA_PATH } from "../params";

// Cache git data to only read it once from disk
let gitData: VersionData;

export function getGitData(): VersionData {
  if (!gitData) gitData = JSON.parse(fs.readFileSync(GIT_DATA_PATH, "utf8"));
  return gitData;
}

/**
 * For debugging, print current version, branch and commit
 * { "version": "0.1.21",
 *   "branch": "master",
 *   "commit": "ab991e1482b44065ee4d6f38741bd89aeaeb3cec" }
 */
export function printGitData() {
  try {
    logs.info("Version info", getGitData());
  } catch (e) {
    if (e.code === "ENOENT") logs.warn(`gitData not found ${GIT_DATA_PATH}`);
    else logs.error("Error reading gitDataPath", e);
  }
}
