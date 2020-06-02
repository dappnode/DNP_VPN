const logs = require("./logs.js")(module);
const params = require("./params");
const startAutobahn = require("./autobahn");
const startHttpApi = require("./server");

// Print version data
require("./utils/getVersionData");

// Start WAMP Transport
const url = "ws://my.wamp.dnp.dappnode.eth:8080/ws";
const realm = "dappnode_admin";
startAutobahn({ url, realm });

// Start JSON RPC API
startHttpApi(3000);

// Check env vars existance and log them
for (const v of [
  params.GLOBAL_ENVS.HOSTNAME,
  params.GLOBAL_ENVS.UPNP_AVAILABLE,
  params.GLOBAL_ENVS.NO_NAT_LOOPBACK,
  params.GLOBAL_ENVS.INTERNAL_IP,
])
  if (!process.env[v]) logs.warn(`Required global env not set: ${v}`);
  else logs.info(`${v}: ${process.env[v]}`);
