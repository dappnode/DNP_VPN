import { startHttpApi } from "./api";
import { getMasterAdminCred } from "./calls";
import { printGitData } from "./utils/gitData";
import { startCredentialsWebserver } from "./credentials";
import { API_PORT, OPENVPN_CRED_PORT, MAIN_ADMIN_NAME } from "./params";
import { fetchHostname } from "./dappmanager/fetchHostname";
import { initalizeOpenVpnConfig, openvpnBinary } from "./openvpn";
import { config } from "./config";
import { startCredentialsService } from "./credentials";
import { logs } from "./logs";

// Print version data
printGitData();

// Start JSON RPC API
startHttpApi(API_PORT);

// Start credentials webserver
startCredentialsWebserver(OPENVPN_CRED_PORT);

// Load persisted tokens and prune old on interval
startCredentialsService();

// Configure and start VPN client
(async function startVpnClient(): Promise<void> {
  try {
    config.vpnStatus = { status: "FETCHING_CONFIG" };
    const hostname = await fetchHostname({
      onRetry: (errorMsg, retryCount) => {
        config.vpnStatus = {
          status: "FETCHING_CONFIG_ERROR",
          retryCount,
          msg: errorMsg
        };
        logs.info(`Fetching config retry ${retryCount}: ${errorMsg}`);
      }
    });
    config.hostname = hostname;
    logs.info(`Initializing OpenVPN config, hostname: ${config.hostname}`);
    config.vpnStatus = { status: "INITIALIZING" };
    await initalizeOpenVpnConfig(config.hostname);

    try {
      await getMasterAdminCred();
    } catch (e) {
      logs.error(`Error creating ${MAIN_ADMIN_NAME} device`, e);
    }

    config.vpnStatus = { status: "READY" };
    openvpnBinary.restart();
  } catch (e) {
    logs.error("Error starting VPN", e);
    process.exit(1);
  }
})();
