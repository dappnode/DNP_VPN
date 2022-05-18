"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NO_HOSTNAME_RETURNED_ERROR = exports.GLOBAL_ENVS_KEYS = exports.GLOBAL_ENVS = exports.CRED_URL_PATHNAME = exports.CRED_URL_QUERY_PARAM = exports.OPENVPN_CRED_PORT = exports.CLIENT_CONNECT_PATHNAME = exports.API_PORT = exports.OPENVPN_CRED_DIR = exports.PROXY_ARP_PATH = exports.PKI_PATH = exports.OPENVPN_CCD_DIR = exports.OPENVPN = exports.TOKENS_DB_PATH = exports.ADMIN_IP_RANGE = exports.MASTER_ADMIN_IP = exports.MAIN_ADMIN_NAME = exports.USER_LIMIT = exports.dappmanagerApiUrlGlobalEnvs = exports.dappmanagerApiUrl = void 0;
const path_1 = __importDefault(require("path"));
// DAPPMANAGER Params
exports.dappmanagerApiUrl = "http://172.33.1.7";
exports.dappmanagerApiUrlGlobalEnvs = `${exports.dappmanagerApiUrl}/global-envs`;
// OpenVPN parameters
exports.USER_LIMIT = 500;
exports.MAIN_ADMIN_NAME = "dappnode_admin";
exports.MASTER_ADMIN_IP = "172.33.10.1";
exports.ADMIN_IP_RANGE = ["172.33.10.2", "172.33.11.250"];
// Paths
exports.TOKENS_DB_PATH = "/usr/src/app/secrets/tokens-db.json";
exports.OPENVPN = "/etc/openvpn";
exports.OPENVPN_CCD_DIR = path_1.default.join(exports.OPENVPN, "ccd");
exports.PKI_PATH = path_1.default.join(exports.OPENVPN, "/pki/reqs");
exports.PROXY_ARP_PATH = "/proc/sys/net/ipv4/conf/eth0/proxy_arp";
exports.OPENVPN_CRED_DIR = "/usr/www/openvpn/cred";
// API params
exports.API_PORT = 3000;
exports.CLIENT_CONNECT_PATHNAME = "/client-connect";
exports.OPENVPN_CRED_PORT = 8092;
exports.CRED_URL_QUERY_PARAM = "id";
exports.CRED_URL_PATHNAME = "/cred";
// Global ENVs names
exports.GLOBAL_ENVS = {
    ACTIVE: "_DAPPNODE_GLOBAL_ENVS_ACTIVE",
    DOMAIN: "_DAPPNODE_GLOBAL_DOMAIN",
    STATIC_IP: "_DAPPNODE_GLOBAL_STATIC_IP",
    HOSTNAME: "_DAPPNODE_GLOBAL_HOSTNAME",
    INTERNAL_IP: "_DAPPNODE_GLOBAL_INTERNAL_IP",
    UPNP_AVAILABLE: "_DAPPNODE_GLOBAL_UPNP_AVAILABLE",
    NO_NAT_LOOPBACK: "_DAPPNODE_GLOBAL_NO_NAT_LOOPBACK",
    PUBKEY: "_DAPPNODE_GLOBAL_PUBKEY",
    PUBLIC_IP: "_DAPPNODE_GLOBAL_PUBLIC_IP",
    SERVER_NAME: "_DAPPNODE_GLOBAL_SERVER_NAME" // "MyDAppNode"
};
exports.GLOBAL_ENVS_KEYS = {
    ACTIVE: "ACTIVE",
    DOMAIN: "DOMAIN",
    STATIC_IP: "STATIC_IP",
    HOSTNAME: "HOSTNAME",
    INTERNAL_IP: "INTERNAL_IP",
    UPNP_AVAILABLE: "UPNP_AVAILABLE",
    NO_NAT_LOOPBACK: "NO_NAT_LOOPBACK",
    PUBKEY: "PUBKEY",
    PUBLIC_IP: "PUBLIC_IP",
    SERVER_NAME: "SERVER_NAME"
};
// Internal error messages
/**
 * This error happens when the config is polled from the DAPPMANAGER which is
 * already active but has not completed the initializeDb process. When this error
 * happens show OK messages to the user since it's an expected situation
 */
exports.NO_HOSTNAME_RETURNED_ERROR = "No hostname returned";
//# sourceMappingURL=params.js.map