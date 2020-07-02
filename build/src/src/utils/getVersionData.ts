import { logs } from "../logs";
import { VersionData } from "../types";

/**
 * For debugging, print current version, branch and commit
 * { "version": "0.1.21",
 *   "branch": "master",
 *   "commit": "ab991e1482b44065ee4d6f38741bd89aeaeb3cec" }
 */
let versionData: VersionData = {} as VersionData;
try {
  versionData = require("../../.version.json");
  logs.info(`Version info: \n${JSON.stringify(versionData, null, 2)}`);
} catch (e) {
  logs.error(`Error printing current version ${e.stack}`);
}

export default versionData;
