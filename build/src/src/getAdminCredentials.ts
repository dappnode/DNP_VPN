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
import { API_PORT, NO_HOSTNAME_RETURNED_ERROR } from "./params";
import { renderQrCode } from "./utils/renderQrCode";
import { VpnStatus } from "./types";

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

let lastRetryMessage: string;

/**
 * Utility error to track expected 'still initializing' errors
 */
class NotReadyError extends Error {
  status: VpnStatus;
  constructor(status: VpnStatus) {
    super(`Initializing VPN, ${status.status} ${status.msg}`);
    this.status = status;
  }
}

(async function(): Promise<void> {
  try {
    console.log(
      `Fetching DAppNode VPN credentials. It may take some time; use CTRL + C to stop`
    );

    // Track time to not log errors right away
    const fetchStartTime = Date.now();

    // Wait for READY status
    await retry(
      async () => {
        const status = await api.getStatus();
        if (status.status !== "READY") throw new NotReadyError(status);
      },
      {
        retries: 10,
        onRetry: e => {
          const errorMsg =
            e instanceof NotReadyError &&
            e.status.msg === NO_HOSTNAME_RETURNED_ERROR
              ? "Initializing DAppNode..."
              : e.message;

          // Don't log errors for the first 3 seconds
          if (Date.now() - fetchStartTime < 3000) return;

          // If the same error message has already been printed, print just a dot
          if (lastRetryMessage !== errorMsg) process.stdout.write(errorMsg);
          else process.stdout.write(".");
          lastRetryMessage = errorMsg;
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
