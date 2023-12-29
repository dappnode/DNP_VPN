import fs from "fs";
import { shell, shellArgs } from "../utils/shell";
import { directoryIsEmptyOrEnoent } from "../utils/fs";
import { PKI_PATH, PROXY_ARP_PATH } from "../params";
import { logs } from "../logs";
import { getDockerContainerIP } from "../utils/getDockerContainerIp";

type OvpnGenConfigFlags = {
  c: string; // Enable traffic among the clients connected to the VPN (Boolean, no value)
  d: string; // Disable default route (disables NAT without '-N'). Only specific traffic will go through the VPN (Boolean, no value)
  u: string; // Hostname the clients will use to connect to the VPN
  s: string; // Subnet the server will use to assign IPs to the clients
  p: string; // Route to push to the client
  n: string; // DNS server (BIND)
  // There are more flags available, but we don't need them here
};

/**
 * Initializes the OpenVPN configuration
 * This function MUST be called before starting the openvpn binary
 */
export async function initalizeOpenVpnConfig(hostname: string): Promise<void> {
  // Replicate environment used in entrypoint.sh
  const openVpnEnv = {
    OVPN_CN: hostname,
    EASYRSA_REQ_CN: hostname
  };
  let genConfigFlags: OvpnGenConfigFlags;

  logs.info("Initializing OpenVPN configuration");

  // Check current IP range
  const containerIp = getDockerContainerIP();

  // If container IP is inside 172.33.0.0/16 --> generate credentials A
  if (containerIp && containerIp.startsWith("172.33.")) {
    logs.info("Generating credentials for IP range 172.33.0.0/16");
    genConfigFlags = {
      c: "",
      d: "",
      u: `udp://"${hostname}"`,
      s: "172.33.8.0/22",
      p: `"route 172.33.0.0 255.255.0.0"`,
      n: `"172.33.1.2"`
    };

    // Else (default, but it should be 10.20.0.0/24) --> generate credentials B
  } else {
    logs.info("Generating credentials for IP range 10.20.0.0/24");
    genConfigFlags = {
      c: "",
      d: "",
      u: `udp://"${hostname}"`,
      s: "10.20.0.240/28",
      p: `"route 10.20.0.0 255.255.255.0"`,
      n: `"10.20.0.2"`
    };
  }

  // Initialize config and PKI
  const output = await shellArgs(
    "ovpn_genconfig",
    genConfigFlags,
    { env: { ...process.env, ...openVpnEnv } }
  );

  logs.info(`OpenVPN configuration output:\n\n${output}\n\n`);

  // Check if PKI is initalized already, if not use hostname as CN
  if (directoryIsEmptyOrEnoent(PKI_PATH))
    await shell("ovpn_initpki nopass", {
      env: { ...process.env, ...openVpnEnv }
    });

  // Enable Proxy ARP (needs privileges)
  fs.writeFileSync(PROXY_ARP_PATH, "1");
}
