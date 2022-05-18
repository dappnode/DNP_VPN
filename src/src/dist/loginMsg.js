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
exports.generateLoginMsg = exports.generateAndWriteLoginMsg = exports.loginMsgPath = void 0;
const fs_1 = __importDefault(require("fs"));
const renderQrCode_1 = require("./utils/renderQrCode");
const params_1 = require("./params");
// necessary for cleaning in testing
exports.loginMsgPath = process.env.LOGIN_MSG_PATH || "./loginMsgFile.txt";
function generateAndWriteLoginMsg(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const loginMsg = yield generateLoginMsg(url);
        fs_1.default.writeFileSync(exports.loginMsgPath, loginMsg, "utf8");
        return loginMsg; // return for testing
    });
}
exports.generateAndWriteLoginMsg = generateAndWriteLoginMsg;
function generateLoginMsg(url) {
    return __awaiter(this, void 0, void 0, function* () {
        let msg = "\n\n";
        // Show the QR code
        // Wraps qrcode library's callback style into a promise
        if (!url)
            throw Error("generateLoginMsg: url is empty or not defined");
        msg += yield renderQrCode_1.renderQrCode(url);
        // Show credentials
        msg += `\n To connect to your DAppNode scan the QR above or copy/paste link below into your browser:
  ${url}\n`;
        if (process.env[params_1.GLOBAL_ENVS.UPNP_AVAILABLE] &&
            (process.env[params_1.GLOBAL_ENVS.UPNP_AVAILABLE] || "").trim() == "false") {
            msg += `\n ALERT: You may not be able to connect. Turn your router's UPnP on or open the VPN port (1194/udp) manually`;
        }
        if (process.env[params_1.GLOBAL_ENVS.NO_NAT_LOOPBACK] &&
            (process.env[params_1.GLOBAL_ENVS.NO_NAT_LOOPBACK] || "").trim() == "false") {
            msg += `\n ALERT: NAT-Loopback is disabled. If you are connecting from the same network as your DAppNode use the internal IP: ${process.env[params_1.GLOBAL_ENVS.INTERNAL_IP]}`;
        }
        return msg;
    });
}
exports.generateLoginMsg = generateLoginMsg;
//# sourceMappingURL=loginMsg.js.map