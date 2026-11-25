import fs from "fs";
import { shell } from "../utils/shell";
import { directoryIsEmptyOrEnoent } from "../utils/fs";
import { PKI_PATH, PROXY_ARP_PATH } from "../params";
import { logs } from "../logs";
import { getContainerIP } from "../utils/getDockerContainerIp";

interface OvpnGenConfigOptions {
  subnet: string; // -s Subnet the server will use to assign IPs to the clients
  route: string; // -p Route to push to the client
  dns: string; // -n DNS server (BIND)
}

/**
 * Initializes the OpenVPN configuration
 * This function MUST be called before starting the openvpn binary
 */
export async function initalizeOpenVpnConfig(hostname: string): Promise<void> {
  const vpnContainerDomain = "vpn.dappnode";
  // Replicate environment used in entrypoint.sh
  const openVpnEnv = {
    OVPN_CN: hostname,
    EASYRSA_REQ_CN: hostname
  };
  let genConfig: OvpnGenConfigOptions;

  logs.info("Initializing OpenVPN configuration");

  // Check current IP range
  const containerIp = await getContainerIP(vpnContainerDomain);

  // If container IP is inside 172.33.0.0/16 --> generate credentials A
  if (containerIp && containerIp.startsWith("172.33.")) {
    logs.info("Generating credentials for IP range 172.33.0.0/16");
    genConfig = {
      subnet: "172.33.8.0/22",
      route: "route 172.33.0.0 255.255.0.0",
      dns: "172.33.1.2"
    };

    // Else (default, but it should be 10.20.0.0/24) --> generate credentials B
  } else {
    logs.info("Generating credentials for IP range 10.20.0.0/24");
    genConfig = {
      subnet: "10.20.0.240/28",
      route: "route 10.20.0.0 255.255.255.0",
      dns: "10.20.0.2"
    };
  }

  // Initialize config and PKI
  const output = await shell(
    "ovpn_genconfig",
    [
      "-c", // Enable traffic among the clients connected to the VPN
      "-d", // Disable default route. Only specific traffic will go through the VPN
      "-u", // Hostname the clients will use to connect to the VPN
      `udp://${hostname}`,
      "-s",
      genConfig.subnet,
      "-p",
      genConfig.route,
      "-n",
      genConfig.dns
    ],
    { env: { ...process.env, ...openVpnEnv } }
  );

  logs.info(`OpenVPN configuration output:\n\n${output}\n\n`);

  // Check if PKI is initalized already, if not use hostname as CN
  if (directoryIsEmptyOrEnoent(PKI_PATH))
    await shell("ovpn_initpki", ["nopass"], {
      env: { ...process.env, ...openVpnEnv }
    });

  // Enable Proxy ARP (needs privileges)
  fs.writeFileSync(PROXY_ARP_PATH, "1");
}
