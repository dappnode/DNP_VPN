import fs from "fs";
import { shell, shellArgs } from "../utils/shell";
import { directoryIsEmptyOrEnoent } from "../utils/fs";
import { PKI_PATH, PROXY_ARP_PATH } from "../params";

/**
 * Initializes the OpenVPN configuration
 * This function MUST be called before starting the openvpn binary
 */
export async function initalizeOpenVpnConfig(hostname: string): Promise<void> {
  // Replicate environment used in entrypoint.sh
  const openVpnEnv = {
    ...process.env,
    OVPN_CN: hostname,
    EASYRSA_REQ_CN: hostname
  };

  // Initialize config and PKI
  // -c: Client to Client
  // -d: disable default route (disables NAT without '-N')
  // -p "route 172.33.0.0 255.255.0.0": Route to push to the client
  // -n "172.33.1.2": DNS server (BIND)
  await shellArgs(
    "ovpn_genconfig",
    {
      c: true,
      d: true,
      u: `udp://"${hostname}"`,
      s: "172.33.8.0/22",
      p: `"route 172.33.0.0 255.255.0.0"`,
      n: `"172.33.1.2"`
    },
    { env: openVpnEnv }
  );

  // Check if PKI is initalized already, if not use hostname as CN
  if (directoryIsEmptyOrEnoent(PKI_PATH))
    await shell("ovpn_initpki nopass", { env: openVpnEnv });

  // Enable Proxy ARP (needs privileges)
  fs.writeFileSync(PROXY_ARP_PATH, "1");
}
