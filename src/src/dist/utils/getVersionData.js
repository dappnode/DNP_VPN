"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const logs_1 = require("../logs");
const gitDataPath = process.env.GIT_DATA_PATH;
/**
 * For debugging, print current version, branch and commit
 * { "version": "0.1.21",
 *   "branch": "master",
 *   "commit": "ab991e1482b44065ee4d6f38741bd89aeaeb3cec" }
 */
function getGitData() {
    try {
        if (!gitDataPath)
            throw Error("gitDataPath not specified");
        const gitData = fs_1.default.readFileSync(gitDataPath, "utf8");
        logs_1.logs.info("Version info", gitData);
        return JSON.parse(gitData);
    }
    catch (e) {
        if (e.code === "ENOENT")
            logs_1.logs.warn("gitData not found", gitDataPath || "");
        else
            logs_1.logs.error("Error reading gitDataPath", e);
        return {};
    }
}
exports.default = getGitData();
//# sourceMappingURL=getVersionData.js.map