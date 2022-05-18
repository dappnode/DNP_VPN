"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.printGitData = exports.getGitData = void 0;
const fs_1 = __importDefault(require("fs"));
const logs_1 = require("../logs");
// Cache git data to only read it once from disk
let gitData;
function getGitData() {
    if (!gitData) {
        if (!process.env.GIT_DATA_PATH)
            throw Error("GIT_DATA_PATH not set");
        gitData = JSON.parse(fs_1.default.readFileSync(process.env.GIT_DATA_PATH, "utf8"));
    }
    return gitData;
}
exports.getGitData = getGitData;
/**
 * For debugging, print current version, branch and commit
 * { "version": "0.1.21",
 *   "branch": "master",
 *   "commit": "ab991e1482b44065ee4d6f38741bd89aeaeb3cec" }
 * SAFE: Wrapped in try / catch
 */
function printGitData() {
    try {
        logs_1.logs.info("Version info", getGitData());
    }
    catch (e) {
        logs_1.logs.error("Error reading gitDataPath", e);
    }
}
exports.printGitData = printGitData;
//# sourceMappingURL=gitData.js.map