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
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("./api");
const calls_1 = require("./calls");
const gitData_1 = require("./utils/gitData");
const credentials_1 = require("./credentials");
const params_1 = require("./params");
const fetchHostname_1 = require("./dappmanager/fetchHostname");
const openvpn_1 = require("./openvpn");
const config_1 = require("./config");
const credentials_2 = require("./credentials");
const logs_1 = require("./logs");
// Print version data
gitData_1.printGitData();
// Start JSON RPC API
api_1.startHttpApi(params_1.API_PORT);
// Start credentials webserver
credentials_1.startCredentialsWebserver(params_1.OPENVPN_CRED_PORT);
// Load persisted tokens and prune old on interval
credentials_2.startCredentialsService();
// Configure and start VPN client
(function startVpnClient() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            config_1.config.vpnStatus = { status: "FETCHING_CONFIG" };
            const hostname = yield fetchHostname_1.fetchHostname({
                onRetry: (errorMsg, retryCount) => {
                    config_1.config.vpnStatus = {
                        status: "FETCHING_CONFIG_ERROR",
                        retryCount,
                        msg: errorMsg
                    };
                    logs_1.logs.info(`Fetching config retry ${retryCount}: ${errorMsg}`);
                }
            });
            config_1.config.hostname = hostname;
            logs_1.logs.info(`Initializing OpenVPN config, hostname: ${config_1.config.hostname}`);
            config_1.config.vpnStatus = { status: "INITIALIZING" };
            yield openvpn_1.initalizeOpenVpnConfig(config_1.config.hostname);
            try {
                yield calls_1.getMasterAdminCred();
            }
            catch (e) {
                logs_1.logs.error(`Error creating ${params_1.MAIN_ADMIN_NAME} device`, e);
            }
            config_1.config.vpnStatus = { status: "READY" };
            openvpn_1.openvpnBinary.restart();
        }
        catch (e) {
            logs_1.logs.error("Error starting VPN", e);
            process.exit(1);
        }
    });
})();
//# sourceMappingURL=index.js.map