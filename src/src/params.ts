import path from "path";

// DAPPMANAGER Params
export const dappmanagerApiUrl = "http://dappmanager.dappnode";
export const dappmanagerApiUrlGlobalEnvs = `${dappmanagerApiUrl}/global-envs`;

// OpenVPN parameters
export const USER_LIMIT = 500;
export const MAIN_ADMIN_NAME = "dappnode_admin";
export const MASTER_ADMIN_IP = "10.20.0.129";
export const ADMIN_IP_RANGE = ["10.20.0.130", "10.20.0.159"];

// Paths
export const TOKENS_DB_PATH = "/usr/src/app/secrets/tokens-db.json";
export const OPENVPN = "/etc/openvpn";
export const OPENVPN_CCD_DIR = path.join(OPENVPN, "ccd");
export const PKI_PATH = path.join(OPENVPN, "/pki/reqs");
export const PROXY_ARP_PATH = "/proc/sys/net/ipv4/conf/eth0/proxy_arp";
export const OPENVPN_CRED_DIR = "/usr/www/openvpn/cred";

// API params
export const API_PORT = 3000;
export const CLIENT_CONNECT_PATHNAME = "/client-connect";
export const OPENVPN_CRED_PORT = 8092;
export const CRED_URL_QUERY_PARAM = "id";
export const CRED_URL_PATHNAME = "/cred";

// Global ENVs names
export const GLOBAL_ENVS = {
  HOSTNAME: "_DAPPNODE_GLOBAL_HOSTNAME", // "6b3d49d4965584c2.dyndns.dappnode.io" || "138.68.106.96"
  INTERNAL_IP: "_DAPPNODE_GLOBAL_INTERNAL_IP" // "192.168.0.1"
};

// Internal error messages
/**
 * This error happens when the config is polled from the DAPPMANAGER which is
 * already active but has not completed the initializeDb process. When this error
 * happens show OK messages to the user since it's an expected situation
 */
export const NO_HOSTNAME_RETURNED_ERROR = "No hostname returned";
