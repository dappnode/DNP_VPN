"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomToken = exports.sha256 = void 0;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Returns the hash digest of NodeJS native crypto module's sha256
 * @param data
 */
function sha256(data) {
    return crypto_1.default
        .createHash("sha256")
        .update(data)
        .digest("hex");
}
exports.sha256 = sha256;
/**
 * Random token of 32 bytes in hex using crypto.randomBytes
 */
function getRandomToken(length = 16) {
    return crypto_1.default
        .randomBytes(length * 4)
        .toString("base64")
        .replace(/\W/g, "")
        .slice(0, length);
}
exports.getRandomToken = getRandomToken;
//# sourceMappingURL=crypto.js.map