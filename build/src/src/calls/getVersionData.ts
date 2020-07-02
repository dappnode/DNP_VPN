import versionData from "../utils/getVersionData";
import { VersionData } from "../types";

/**
 * Returns the version data of this specific build
 *
 * @return A formated success message.
 * result: versionData = {
 *   "version": "0.1.21",
 *   "branch": "master",
 *   "commit": "ab991e1482b44065ee4d6f38741bd89aeaeb3cec"
 * }
 */
export const getVersionData = async (): Promise<VersionData> => versionData;
