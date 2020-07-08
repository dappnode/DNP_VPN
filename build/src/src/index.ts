import { startHttpApi } from "./api";
import { API_PORT } from "./params";
import { pollDappnodeConfig } from "./pollDappnodeConfig";
import { initalizeOpenVpnConfig, openvpnBinary } from "./openvpn";
import { createMasterAdminUser } from "./createMasterAdminUser";
import { logs } from "./logs";
import { config } from "./config";

// Print version data
require("./utils/getVersionData");

// Start JSON RPC API
startHttpApi(API_PORT);

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
