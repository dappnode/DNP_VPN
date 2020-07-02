const isTest = Boolean(process.env.DEV);

// OpenVPN parameters
export const userLimit = 500;
export const credentialsPort = isTest ? "8092" : process.env.OPENVPN_CRED_PORT;
export const ccdMask = "255.255.252.0";
export const masterAdmin = "dappnode_admin";
export const ipRange = ["172.33.10.2", "172.33.11.250"];

// Paths
export const ccdPath = isTest ? "./mockFiles/ccd" : "/etc/openvpn/ccd";
export const saltPath = isTest
  ? "./mockFiles/salt"
  : process.env.SALT_PATH || "";
export const credentialsDir = isTest
  ? "./mockFiles/creds"
  : process.env.OPENVPN_CRED_DIR;

// API params
export const API_PORT = 3000;

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
