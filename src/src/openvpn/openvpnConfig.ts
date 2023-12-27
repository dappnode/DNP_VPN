import fs from "fs";
import { shell, shellArgs } from "../utils/shell";
import { directoryIsEmptyOrEnoent } from "../utils/fs";
import { PKI_PATH, PROXY_ARP_PATH } from "../params";
import { logs } from "../logs";

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

  logs.info("Initializing OpenVPN configuration");

  // Initialize config and PKI
  // -c: Enable traffic among the clients connected to the VPN
  // -d: Disable default route (disables NAT without '-N'). Only specific traffic will go through the VPN
  // -u "udp://<hostname>": Hostname the clients will use to connect to the VPN
  // -s Subnet the server will use to assign IPs to the clients
  // -p "route 10.20.0.0 255.255.255.0": Route to push to the client
  // -n "10.20.0.2": DNS server (BIND)
  const output = await shellArgs(
    "ovpn_genconfig",
    {
      c: true,
      d: true,
      u: `udp://"${hostname}"`,
      s: "10.20.0.240/28",
      p: `"route 10.20.0.0 255.255.255.0"`,
      n: `"10.20.0.2, 172.33.1.2"`
    },
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
