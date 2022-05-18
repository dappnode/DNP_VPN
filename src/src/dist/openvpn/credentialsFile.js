"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCredFile = exports.isValidCredFilename = exports.writeCredFile = exports.removeCredFile = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const crypto_1 = require("../utils/crypto");
const params_1 = require("../params");
/**
 * @param id "new-device"
 */
function getCredFilePath(id) {
    const salt = fs_1.default.readFileSync(params_1.SALT_PATH, "utf-8");
    const filename = crypto_1.sha256(salt + id).slice(0, 16);
    const filepath = path_1.default.join(params_1.OPENVPN_CRED_DIR, filename);
    return { filename, filepath };
}
/**
 * @param id "new-device"
 */
function removeCredFile(id) {
    const { filepath } = getCredFilePath(id);
    try {
        fs_1.default.unlinkSync(filepath);
    }
    catch (e) {
        if (e.code !== "ENOENT")
            throw e;
    }
    // Reset login text
    if (id === params_1.MASTER_ADMIN_NAME) {
        // echo "The admin credentials expired. Use the command below to generate a new download link:" > "$LOGIN_MSG_PATH"
        // echo "dappnode_get ${DEFAULT_ADMIN_USER}" >> "$LOGIN_MSG_PATH"
    }
}
exports.removeCredFile = removeCredFile;
/**
 * @param id "new-device"
 */
function writeCredFile(id, encryptedCredentials) {
    const { filename, filepath } = getCredFilePath(id);
    fs_1.default.writeFileSync(filepath, encryptedCredentials);
    return { filename };
}
exports.writeCredFile = writeCredFile;
function isValidCredFilename(filename) {
}
exports.isValidCredFilename = isValidCredFilename;
function getCredFile(filename) {
}
exports.getCredFile = getCredFile;
//# sourceMappingURL=credentialsFile.js.map