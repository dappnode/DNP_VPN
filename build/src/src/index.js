const logs = require("./logs.js")(module);
const params = require("./params");
const startHttpApi = require("./server");

// Print version data
require("./utils/getVersionData");

// Start JSON RPC API
startHttpApi(params.API_PORT);

// Check env vars existance and log them
for (const v of [
  params.GLOBAL_ENVS.HOSTNAME,
  params.GLOBAL_ENVS.UPNP_AVAILABLE,
  params.GLOBAL_ENVS.NO_NAT_LOOPBACK,
  params.GLOBAL_ENVS.INTERNAL_IP
])
  if (!process.env[v]) logs.warn(`Required global env not set: ${v}`);
  else logs.info(`${v}: ${process.env[v]}`);
