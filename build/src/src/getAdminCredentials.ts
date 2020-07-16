#!/usr/bin/env node

// This script must return the MASTER_ADMIN credentials formated
// as a nice message in the terminal + a QR code
//
// It will be run as a separate process, maybe in a different container
// It can be run before the VPN is initialized, before the MASTER_ADMIN
// user is created, or after its link has been invalidated
//
// 1. Wait for config to be available
// 2. Wait for MASTER_ADMIN user to exist
// 3. Get the MASTER_ADMIN user URL to connect
// 4. Print a nicely formated msg with a QR code
//
// This script is run by this command
// alias dappnode_connect='docker run --rm \
//   -v dncore_vpndnpdappnodeeth_data:/usr/src/app/secrets \
//   $(docker inspect DAppNodeCore-vpn.dnp.dappnode.eth --format '{{.Config.Image}}') \
//   getAdminCredentials'
//

import { getVpnRpcApiClient } from "./api/getRpcCall";
import { MASTER_ADMIN_NAME } from "./params";
import { renderQrCode } from "./utils/renderQrCode";

/* eslint-disable no-console */

const statusTimeout = 60 * 1000;
const api = getVpnRpcApiClient();

// ### TODO: Is this still necessary?
process.on("SIGINT", () => process.exit(128));

(async function(): Promise<void> {
  await waitForOkStatus();

  try {
    await api.addDevice({ id: MASTER_ADMIN_NAME });
  } catch (e) {
    if (!e.message.includes("exist"))
      console.error(`Error creating ${MASTER_ADMIN_NAME} device`, e);
  }

  const { url } = await api.getDeviceCredentials({ id: MASTER_ADMIN_NAME });

  console.log(`
${await renderQrCode(url)}

To connect to your DAppNode scan the QR above or copy/paste link below into your browser:
${url}`);
})();

/**
 * Wait for VPN status to be READY, use separate function to exit the while loop with return
 */
async function waitForOkStatus(): Promise<void> {
  const start = Date.now();

  while (Date.now() - start < statusTimeout) {
    const status = await api.getStatus();
    if (status.status === "READY") return;
    else console.log(`VPN not ready, status: ${status.status} ${status.msg}`);
  }
  throw Error(`Timeout`);
}
