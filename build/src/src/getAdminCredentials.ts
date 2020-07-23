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

import url from "url";
import retry from "async-retry";
import { getRpcCall } from "./api/getRpcCall";
import { API_PORT } from "./params";
import { renderQrCode } from "./utils/renderQrCode";

/* eslint-disable no-console */

const vpnRpcApiUrl = url.format({
  protocol: "http",
  hostname: "127.0.0.1",
  port: API_PORT,
  pathname: "rpc"
});
const api = getRpcCall(vpnRpcApiUrl);

// If user does CTRL + C, exit process
process.on("SIGINT", () => process.exit(128));

(async function(): Promise<void> {
  try {
    // Wait for READY status
    await retry(
      async () => {
        const status = await api.getStatus();
        if (status.status !== "READY")
          throw Error(`VPN not ready, status: ${status.status} ${status.msg}`);
      },
      {
        retries: 10,
        onRetry: (e, retryCount) => {
          console.log(`retry: #${retryCount} - ${e.message}`);
        }
      }
    );

    const { url } = await api.getMasterAdminCred();

    // If rendering the QR fails, show the error and continue, the raw URL is consumable
    console.log(`
${await renderQrCode(url).catch(e => e.stack)}

To connect to your DAppNode scan the QR above or copy/paste link below into your browser:
${url}`);
  } catch (e) {
    // Exit process cleanly to prevent showing 'Unhandled rejection'
    console.error(e);
    process.exit(1);
  }
})();
