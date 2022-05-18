"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCCD = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const ip_1 = __importDefault(require("ip"));
const logs_1 = require("../logs");
const params_1 = require("../params");
function getCCD() {
    const ccdlist = [];
    for (const filename of fs_1.default.readdirSync(params_1.ccdPath)) {
        const filepath = path_1.default.join(params_1.ccdPath, filename);
        const stats = fs_1.default.statSync(filepath);
        if (!stats.isDirectory()) {
            const data = fs_1.default.readFileSync(filepath, "utf-8");
            const fixedip = data.trim().split(" ")[1];
            if (ip_1.default.isV4Format(fixedip)) {
                ccdlist.push({ cn: filename, ip: fixedip });
            }
            else {
                logs_1.logs.warn(`Invalid IP detected at ccd: ${filename}`);
            }
        }
    }
    return ccdlist;
}
exports.getCCD = getCCD;
//# sourceMappingURL=getCCD.js.map