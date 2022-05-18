"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLowestIpFromRange = void 0;
const ip_1 = __importDefault(require("ip"));
/**
 * Given a collection of IPs, returns the lowest
 * @param ips
 */
function getLowestIpFromRange(ips, ipRange) {
    let lowest = ip_1.default.toLong(ipRange[0]);
    ips
        .sort((a, b) => ip_1.default.toLong(a.ip) - ip_1.default.toLong(b.ip))
        .every(item => {
        if (ip_1.default.toLong(item.ip) > lowest) {
            return false;
        }
        else {
            lowest++;
            return true;
        }
    });
    if (lowest > ip_1.default.toLong(ipRange[1])) {
        throw Error("Maximum admin users reached.");
    }
    return ip_1.default.fromLong(lowest);
}
exports.getLowestIpFromRange = getLowestIpFromRange;
//# sourceMappingURL=ip.js.map