import fs from "fs";
import { logs } from "../logs";
import { VersionData } from "../types";

const gitDataPath = process.env.GIT_DATA_PATH;

/**
 * For debugging, print current version, branch and commit
 * { "version": "0.1.21",
 *   "branch": "master",
 *   "commit": "ab991e1482b44065ee4d6f38741bd89aeaeb3cec" }
 */
function getGitData(): VersionData {
  try {
    if (!gitDataPath) throw Error("gitDataPath not specified");
    const gitData = fs.readFileSync(gitDataPath, "utf8");
    logs.info("Version info", gitData);
    return JSON.parse(gitData);
  } catch (e) {
    if (e.code === "ENOENT") logs.warn("gitData not found", gitDataPath || "");
    else logs.error("Error reading gitDataPath", e);
    return {} as VersionData;
  }
}

export default getGitData();
