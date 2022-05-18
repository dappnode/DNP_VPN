"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInternalIpCached = void 0;
const ip_1 = __importDefault(require("ip"));
const got_1 = __importDefault(require("got"));
const logs_1 = require("../logs");
const params_1 = require("../params");
const config_1 = require("../config");
function getInternalIpCached() {
    return __awaiter(this, void 0, void 0, function* () {
        // internal IP is an optional feature for when NAT-Loopback is off
        try {
            const internalIp = yield got_1.default(params_1.GLOBAL_ENVS_KEYS.INTERNAL_IP, {
                throwHttpErrors: true,
                prefixUrl: params_1.dappmanagerApiUrlGlobalEnvs
            })
                .text()
                .then(res => res.trim());
            if (!ip_1.default.isV4Format(internalIp))
                throw Error(`Invalid internalIp returned: ${internalIp}`);
            config_1.config.internalIp = internalIp;
            return internalIp;
        }
        catch (e) {
            logs_1.logs.warn("Error getting internal IP from DAPPMANAGER", e);
            if (!config_1.config.internalIp)
                throw e;
            return config_1.config.internalIp;
        }
    });
}
exports.getInternalIpCached = getInternalIpCached;
//# sourceMappingURL=fetchInternalIp.js.map