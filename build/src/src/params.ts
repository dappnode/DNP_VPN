import path from "path";

// DAPPMANAGER Params
export const dappmanagerApiUrl = "http://172.33.1.7";
export const dappmanagerApiUrlGlobalEnvs = `${dappmanagerApiUrl}/global-envs`;

// OpenVPN parameters
export const USER_LIMIT = 500;
export const CCD_MASK = "255.255.252.0";
export const MASTER_ADMIN_NAME = "dappnode_admin";
export const MASTER_ADMIN_IP = "172.33.10.1";
export const ADMIN_IP_RANGE = ["172.33.10.2", "172.33.11.250"];

// Paths
export const TOKENS_DB_PATH = "/usr/src/app/secrets/tokens-db.json";
export const OPENVPN = "/etc/openvpn";
export const OPENVPN_CCD_DIR = path.join(OPENVPN, "ccd");
export const PKI_PATH = path.join(OPENVPN, "/pki/reqs");
export const PROXY_ARP_PATH = "/proc/sys/net/ipv4/conf/eth0/proxy_arp";
export const CCD_PATH = "/etc/openvpn/ccd";
export const OPENVPN_CRED_DIR = "/usr/www/openvpn/cred";

// API params
export const API_PORT = 3000;
export const CLIENT_CONNECT_PATHNAME = "/client-connect";
export const OPENVPN_CRED_PORT = 8092;
export const CRED_URL_QUERY_PARAM = "id";
export const CRED_URL_PATHNAME = "/cred";

// Global ENVs names
export const GLOBAL_ENVS = {
  ACTIVE: "_DAPPNODE_GLOBAL_ENVS_ACTIVE",
  DOMAIN: "_DAPPNODE_GLOBAL_DOMAIN", // "" || "6b3d49d4965584c2.dyndns.dappnode.io"
  STATIC_IP: "_DAPPNODE_GLOBAL_STATIC_IP", // "" || "138.68.106.96"
  HOSTNAME: "_DAPPNODE_GLOBAL_HOSTNAME", // "6b3d49d4965584c2.dyndns.dappnode.io" || "138.68.106.96"
  INTERNAL_IP: "_DAPPNODE_GLOBAL_INTERNAL_IP", // "192.168.0.1"
  UPNP_AVAILABLE: "_DAPPNODE_GLOBAL_UPNP_AVAILABLE", // "true" || "false"
  NO_NAT_LOOPBACK: "_DAPPNODE_GLOBAL_NO_NAT_LOOPBACK", // "true" || "false"
  PUBKEY: "_DAPPNODE_GLOBAL_PUBKEY", // "0x6B3D49d4965584C28Fbf14B82b1012664a73b9Ab"
  PUBLIC_IP: "_DAPPNODE_GLOBAL_PUBLIC_IP", // "138.68.106.96"
  SERVER_NAME: "_DAPPNODE_GLOBAL_SERVER_NAME" // "MyDAppNode"
};

export const GLOBAL_ENVS_KEYS: { [K in keyof typeof GLOBAL_ENVS]: K } = {
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
export const NO_HOSTNAME_RETURNED_ERROR = "No hostname returned";
