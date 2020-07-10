import { startHttpApi } from "./api";
import { printGitData } from "./utils/gitData";
import { startCredentialsWebserver } from "./credentials";
import { API_PORT, OPENVPN_CRED_PORT } from "./params";
import { pollDappnodeConfig } from "./pollDappnodeConfig";
import { initalizeOpenVpnConfig, openvpnBinary } from "./openvpn";
import { createMasterAdminUser } from "./createMasterAdminUser";
import { logs } from "./logs";
import { config } from "./config";
import { startCredentialsService } from "./credentials/credentialsFile";

// Print version data
printGitData();

// Start JSON RPC API
startHttpApi(API_PORT);

// Start credentials webserver
startCredentialsWebserver(OPENVPN_CRED_PORT);

// Configure and start VPN client
pollDappnodeConfig()
  .then(({ hostname, internalIp }) => {
    config.hostname = hostname;
    config.internalIp = internalIp;
    logs.info("Initializing OpenVPN config");
    return initalizeOpenVpnConfig({ hostname, internalIp });
  })
  .then(() => openvpnBinary.restart())
  .then(() => createMasterAdminUser())
  .catch(e => {
    console.error("Error starting VPN", e);
    process.exit(1);
  });

// Load persisted tokens and prune old on interval
startCredentialsService();
