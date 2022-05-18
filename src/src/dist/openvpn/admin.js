"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeAdmin = exports.grantAdmin = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const getCCD_1 = require("./getCCD");
const ip_1 = require("../utils/ip");
const params_1 = require("../params");
/**
 * Grants admin credentials to device `id` on IP `ip`
 * Warning: Does not enforce that `ip` actually holds admin priviledges
 * @param id "my-device"
 */
function grantAdmin(id) {
    const ip = id === params_1.MAIN_ADMIN_NAME
        ? params_1.MASTER_ADMIN_IP
        : ip_1.getLowestIpFromRange(getCCD_1.getCCD(), params_1.ADMIN_IP_RANGE);
    const ccdContent = `ifconfig-push ${ip} ${params_1.CCD_MASK}\r\n`;
    fs_1.default.writeFileSync(getCcdFilePath(id), ccdContent);
}
exports.grantAdmin = grantAdmin;
/**
 * Revokes admin credentials to device `id`
 * @param id "my-device"
 */
function revokeAdmin(id) {
    try {
        fs_1.default.unlinkSync(getCcdFilePath(id));
    }
    catch (err) {
        throw Error(`Error revoking CCD file of: ${id}`);
    }
}
exports.revokeAdmin = revokeAdmin;
/**
 * Path to the CCD file that controls if a device is admin or not
 * @param id "my-device"
 */
function getCcdFilePath(id) {
    return path_1.default.join(params_1.CCD_PATH, id);
}
//# sourceMappingURL=admin.js.map