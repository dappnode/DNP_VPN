import { startHttpApi } from "./api";
import { addDevice } from "./calls";
import { printGitData } from "./utils/gitData";
import { startCredentialsWebserver } from "./credentials";
import { API_PORT, OPENVPN_CRED_PORT, MASTER_ADMIN_NAME } from "./params";
import { pollDappnodeConfig } from "./pollDappnodeConfig";
import { initalizeOpenVpnConfig, openvpnBinary } from "./openvpn";
import { config, vpnStatus } from "./config";
import { startCredentialsService } from "./credentials/credentialsFile";
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
(async function startVpnClient() {
  try {
    vpnStatus.status = "FETCHING_CONFIG";
    const { hostname, internalIp } = await pollDappnodeConfig({
      onRetry: (errorMsg, retryCount) => {
        vpnStatus.status = "FETCHING_CONFIG_ERROR";
        vpnStatus.msg = `#${retryCount} - ${errorMsg}`;
        logs.info(`Fetching config retry: ${vpnStatus.msg}`);
      }
    });
    config.hostname = hostname;
    config.internalIp = internalIp;

    logs.info("Initializing OpenVPN config", { hostname, internalIp });
    vpnStatus.status = "INITIALIZING";
    await initalizeOpenVpnConfig({ hostname, internalIp });

    try {
      await addDevice({ id: MASTER_ADMIN_NAME });
    } catch (e) {
      if (!e.message.includes("exist"))
        logs.error(`Error creating ${MASTER_ADMIN_NAME} device`, e);
    }

    vpnStatus.status = "READY";
    openvpnBinary.restart();
  } catch (e) {
    logs.error("Error starting VPN", e);
    process.exit(1);
  }
})();
