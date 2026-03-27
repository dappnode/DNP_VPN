import fs from "fs";
import { shell } from "../utils/shell";
import { directoryIsEmptyOrEnoent } from "../utils/fs";
import { PKI_PATH, PROXY_ARP_PATH } from "../params";
import { logs } from "../logs";

export async function initalizeOpenVpnConfig(hostname: string): Promise<string> {
  const openVpnEnv = {
    ...process.env,
    OVPN_CN: hostname,
    EASYRSA_REQ_CN: hostname,
  };

  logs.info("Initializing OpenVPN configuration (both subnets + both DNS)");

  // Build the full ovpn_genconfig command with multiple -s, -p, -n flags:
  const genCmd = [
    "ovpn_genconfig",
    "-c",               // client-to-client
    "-d",               // disable default route
    "-u", `udp://"${hostname}"`,
    "-s", "10.20.0.0/24",
    "-s", "172.33.0.0/16",
    "-p", "route 10.20.0.0 255.255.255.0",
    "-p", "route 172.33.0.0 255.255.0.0",
    "-n", "10.20.0.2",
    "-n", "172.33.1.2",
  ].join(" ");

  // Generate server configuration
  const genOutput = await shell(genCmd, { env: openVpnEnv });
  logs.info(`ovpn_genconfig output:\n${genOutput}`);

  // Initialize the PKI if needed
  if (directoryIsEmptyOrEnoent(PKI_PATH)) {
    const initPkiOutput = await shell("ovpn_initpki nopass", {
      env: openVpnEnv,
    });
    logs.info(`ovpn_initpki output:\n${initPkiOutput}`);
  }

  // Enable proxy ARP
  fs.writeFileSync(PROXY_ARP_PATH, "1");

  // Finally, generate and return the client bundle
  const clientConfig = await shell(`ovpn_getclient "${hostname}"`, {
    env: openVpnEnv,
  });
  logs.info(`Generated client configuration for ${hostname}`);

  return clientConfig;
}
