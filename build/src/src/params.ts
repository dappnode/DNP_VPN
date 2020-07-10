import path from "path";

const isTest = Boolean(process.env.TEST);

// DAPPMANAGER Params
export const dappmanagerApiUrl = "http://dappmanager.dappnode";
export const dappmanagerApiUrlGlobalEnvs = `${dappmanagerApiUrl}/global-envs`;

// OpenVPN parameters
export const USER_LIMIT = 500;
export const CCD_MASK = "255.255.252.0";
export const MASTER_ADMIN_NAME = "dappnode_admin";
export const MASTER_ADMIN_IP = "172.33.10.1";
export const ADMIN_IP_RANGE = ["172.33.10.2", "172.33.11.250"];

// Paths
if (!process.env.TOKENS_DB_PATH) throw Error("No TOKENS_DB_PATH");
if (!process.env.GIT_DATA_PATH) throw Error("No GIT_DATA_PATH");
export const TOKENS_DB_PATH = process.env.TOKENS_DB_PATH;
export const OPENVPN = "/etc/openvpn";
export const OPENVPN_CCD_DIR = path.join(OPENVPN, "ccd");
export const PKI_PATH = path.join(OPENVPN, "/pki/reqs");
export const PROXY_ARP_PATH = "/proc/sys/net/ipv4/conf/eth0/proxy_arp";
export const CCD_PATH = "/etc/openvpn/ccd";
export const SALT_PATH = "/usr/src/app/secrets/salt";
export const OPENVPN_CRED_DIR = "/usr/www/openvpn/cred";
export const GIT_DATA_PATH = process.env.GIT_DATA_PATH;

// API params
if (!process.env.OPENVPN_CRED_PORT) throw Error("No OPENVPN_CRED_PORT");
if (!process.env.UI_OPENVPN_PATH) throw Error("No UI_OPENVPN_PATH");
if (!process.env.CRED_URL_QUERY_PARAM) throw Error("CRED_URL_QUERY_PARAM");
if (!process.env.CRED_URL_PATHNAME) throw Error("No CRED_URL_PATHNAME");
export const API_PORT = 3000;
export const CLIENT_CONNECT_PATHNAME = "/client-connect";
export const OPENVPN_CRED_PORT = parseInt(process.env.OPENVPN_CRED_PORT);
export const UI_OPENVPN_PATH = process.env.UI_OPENVPN_PATH;
export const CRED_URL_QUERY_PARAM = process.env.CRED_URL_QUERY_PARAM;
export const CRED_URL_PATHNAME = process.env.CRED_URL_PATHNAME;

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
