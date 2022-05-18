#!/usr/bin/env node
"use strict";
// This script must return the MASTER_ADMIN credentials formated
// as a nice message in the terminal + a QR code
//
// It will be run as a separate process, maybe in a different container
// It can be run before the VPN is initialized, before the MASTER_ADMIN
// user is created, or after its link has been invalidated
//
// 1. Wait for config to be available
// 2. Wait for MASTER_ADMIN user to exist
// 3. Get the MASTER_ADMIN user URL to connect
// 4. Print a nicely formated msg with a QR code
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
const url_1 = __importDefault(require("url"));
const async_retry_1 = __importDefault(require("async-retry"));
const getRpcCall_1 = require("./api/getRpcCall");
const params_1 = require("./params");
const renderQrCode_1 = require("./utils/renderQrCode");
/* eslint-disable no-console */
const vpnRpcApiUrl = url_1.default.format({
    protocol: "http",
    hostname: "127.0.0.1",
    port: params_1.API_PORT,
    pathname: "rpc"
});
const api = getRpcCall_1.getRpcCall(vpnRpcApiUrl);
// If user does CTRL + C, exit process
process.on("SIGINT", () => process.exit(128));
let lastRetryMessage;
/**
 * Utility error to track expected 'still initializing' errors
 */
class NotReadyError extends Error {
    constructor(status) {
        super(`Initializing VPN, ${status.status} ${status.msg}`);
        this.status = status;
    }
}
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log(`Fetching DAppNode VPN credentials. It may take some time; use CTRL + C to stop`);
            // Track time to not log errors right away
            const fetchStartTime = Date.now();
            // Wait for READY status
            yield async_retry_1.default(() => __awaiter(this, void 0, void 0, function* () {
                const status = yield api.getStatus();
                if (status.status !== "READY")
                    throw new NotReadyError(status);
            }), {
                retries: 10,
                onRetry: e => {
                    const errorMsg = e instanceof NotReadyError &&
                        e.status.msg === params_1.NO_HOSTNAME_RETURNED_ERROR
                        ? "Initializing DAppNode..."
                        : e.message;
                    // Don't log errors for the first 3 seconds
                    if (Date.now() - fetchStartTime < 3000)
                        return;
                    // If the same error message has already been printed, print just a dot
                    if (lastRetryMessage !== errorMsg)
                        process.stdout.write(errorMsg);
                    else
                        process.stdout.write(".");
                    lastRetryMessage = errorMsg;
                }
            });
            const { url } = yield api.getMasterAdminCred();
            // If rendering the QR fails, show the error and continue, the raw URL is consumable
            console.log(`

${yield renderQrCode_1.renderQrCode(url).catch(e => e.stack)}

To connect to your DAppNode scan the QR above or copy/paste link below into your browser:
${url}`);
        }
        catch (e) {
            // Exit process cleanly to prevent showing 'Unhandled rejection'
            console.error(e);
            process.exit(1);
        }
    });
})();
//# sourceMappingURL=getAdminCredentials.js.map