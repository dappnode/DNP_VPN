const autobahn = require("autobahn");
const logs = require("./logs.js")(module);
const { eventBus, eventBusTag } = require("./eventBus");
const params = require("./params");
// Utils
const registerHandler = require("./utils/registerHandler");
// import calls
const calls = require("./calls");

// Print version data
require("./utils/getVersionData");

/**
 * 1. Setup crossbar connection
 * ============================
 *
 * Will register the VPN user managment node app to the the DAppNode's crossbar WAMP
 * It automatically registers all handlers exported in the calls/index.js file
 * Each handler is wrapped with a custom function to format its success and error messages
 */
const url = "ws://my.wamp.dnp.dappnode.eth:8080/ws";
const realm = "dappnode_admin";

const connection = new autobahn.Connection({
  url,
  realm
});

connection.onopen = function(session, details) {
  logs.info(`Connected to DAppNode's WAMP
  url:     ${url}
  realm:   ${realm}
  session: ${(details || {}).authid}`);

  registerHandler(session, "ping.vpn.dnp.dappnode.eth", x => x);
  for (const callId of Object.keys(calls)) {
    registerHandler(session, callId + ".vpn.dnp.dappnode.eth", calls[callId]);
  }

  /*
   * Utilities to encode arguments to publish with the Crossbar format (args, kwargs)
   * - Publisher:
   *     publish("event.name", arg1, arg2)
   * - Subscriber:
   *     subscribe("event.name", function(arg1, arg2) {})
   */
  function publish(event, ...args) {
    // session.publish(topic, args, kwargs, options)
    session.publish(event, args);
  }

  /**
   * Emits the devices list to the UI
   * @param {array} devices = [{
   *   id: "MyPhone",
   *   isAdmin: false
   * }, ... ]
   */
  eventBus.onSafe(
    eventBusTag.emitDevices,
    async () => {
      const devices = (await calls.listDevices()).result;
      publish("devices.vpn.dnp.dappnode.eth", devices);
    },
    { isAsync: true }
  );
};

connection.onclose = (reason, details) => {
  logs.warn(
    `WAMP connection closed: ${reason} ${(details || {}).message || ""}`
  );
};

connection.open();
logs.info(`Attempting WAMP connection to ${url}, realm: ${realm}`);

// Check env vars existance and log them
for (const v of [
  params.GLOBAL_ENVS.HOSTNAME,
  params.GLOBAL_ENVS.UPNP_AVAILABLE,
  params.GLOBAL_ENVS.NO_NAT_LOOPBACK,
  params.GLOBAL_ENVS.INTERNAL_IP
])
  if (!process.env[v]) logs.warn(`Required global env not set: ${v}`);
  else logs.info(`${v}: ${process.env[v]}`);
