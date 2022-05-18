"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.directoryIsEmptyOrEnoent = void 0;
const fs_1 = __importDefault(require("fs"));
/**
 * Checks if a directory is empty, or not existent or not a directory
 * @param dirPath
 */
function directoryIsEmptyOrEnoent(dirPath) {
    try {
        const files = fs_1.default.readdirSync(dirPath);
        return files.length === 0;
    }
    catch (e) {
        if (e.code === "ENOENT" || e.code === "ENOTDIR")
            return true;
        throw e;
    }
}
exports.directoryIsEmptyOrEnoent = directoryIsEmptyOrEnoent;
//# sourceMappingURL=fs.js.map