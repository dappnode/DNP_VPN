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
exports.initalizeOpenVpnConfig = void 0;
const fs_1 = __importDefault(require("fs"));
const shell_1 = require("../utils/shell");
const fs_2 = require("../utils/fs");
const params_1 = require("../params");
/**
 * Initializes the OpenVPN configuration
 * This function MUST be called before starting the openvpn binary
 */
function initalizeOpenVpnConfig(hostname) {
    return __awaiter(this, void 0, void 0, function* () {
        // Replicate environment used in entrypoint.sh
        const openVpnEnv = {
            OVPN_CN: hostname,
            EASYRSA_REQ_CN: hostname
        };
        // Initialize config and PKI
        // -c: Client to Client
        // -d: disable default route (disables NAT without '-N')
        // -p "route 172.33.0.0 255.255.0.0": Route to push to the client
        // -n "172.33.1.2": DNS server (BIND)
        yield shell_1.shellArgs("ovpn_genconfig", {
            c: true,
            d: true,
            u: `udp://"${hostname}"`,
            s: "172.33.8.0/22",
            p: `"route 172.33.0.0 255.255.0.0"`,
            n: `"172.33.1.2"`
        }, { env: Object.assign(Object.assign({}, process.env), openVpnEnv) });
        // Check if PKI is initalized already, if not use hostname as CN
        if (fs_2.directoryIsEmptyOrEnoent(params_1.PKI_PATH))
            yield shell_1.shell("ovpn_initpki nopass", {
                env: Object.assign(Object.assign({}, process.env), openVpnEnv)
            });
        // Enable Proxy ARP (needs privileges)
        fs_1.default.writeFileSync(params_1.PROXY_ARP_PATH, "1");
    });
}
exports.initalizeOpenVpnConfig = initalizeOpenVpnConfig;
//# sourceMappingURL=openvpnConfig.js.map