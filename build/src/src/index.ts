import { startHttpApi } from "./server";
import { logs } from "./logs";
import { API_PORT, GLOBAL_ENVS } from "./params";

// Print version data
require("./utils/getVersionData");

// Start JSON RPC API
startHttpApi(API_PORT);

// Check env vars existance and log them
for (const v of [
  GLOBAL_ENVS.HOSTNAME,
  GLOBAL_ENVS.UPNP_AVAILABLE,
  GLOBAL_ENVS.NO_NAT_LOOPBACK,
  GLOBAL_ENVS.INTERNAL_IP
])
  if (!process.env[v]) logs.warn(`Required global env not set: ${v}`);
  else logs.info(`${v}: ${process.env[v]}`);
