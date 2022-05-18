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
exports.pollDappnodeHostname = void 0;
const got_1 = __importDefault(require("got"));
const ip_1 = __importDefault(require("ip"));
const async_retry_1 = __importDefault(require("async-retry"));
const params_1 = require("./params");
const domain_1 = require("./utils/domain");
/**
 * Polls the DAPPMANAGER to get the HOSTNAME (domain or IP) necessary to start
 * the VPN config. If available, fetches the ENVs from process.env
 * It throws an error after about 15 min of retries. The error should cause
 * the main process to crash and be restarted by it's parent manager (i.e. docker)
 */
function pollDappnodeHostname({ onRetry }) {
    return __awaiter(this, void 0, void 0, function* () {
        const hostNameFromEnv = process.env[params_1.GLOBAL_ENVS.HOSTNAME];
        if (hostNameFromEnv)
            return hostNameFromEnv;
        return yield async_retry_1.default(() => got_1.default(params_1.GLOBAL_ENVS_KEYS.HOSTNAME, {
            throwHttpErrors: true,
            prefixUrl: params_1.dappmanagerApiUrlGlobalEnvs,
            retry: 10,
            hooks: {
                beforeRetry: [
                    (_0, e, retryCount = 0) => {
                        onRetry(e ? `${e.code} ${e.message}` : "", retryCount);
                    }
                ]
            }
        })
            .text()
            .then(res => res.trim())
            .then(data => {
            if (!data)
                throw Error(params_1.NO_HOSTNAME_RETURNED_ERROR);
            if (!ip_1.default.isV4Format(data) && !domain_1.isDomain(data))
                throw Error(`Invalid hostname returned: ${data}`);
            return data;
        }), {
            retries: 10,
            onRetry: (e, retryCount) => {
                onRetry(e.message, retryCount);
            }
        });
    });
}
exports.pollDappnodeHostname = pollDappnodeHostname;
//# sourceMappingURL=pollDappnodeConfig.js.map