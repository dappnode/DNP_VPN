const autobahn = require("autobahn");
const logs = require("./logs.js")(module);
const db = require("./db");
const { eventBus, eventBusTag } = require("./eventBus");
// Modules
const dyndnsClient = require("./dyndnsClient");
// Utils
const registerHandler = require("./utils/registerHandler");
const setIntervalAndRun = require("./utils/setIntervalAndRun");
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

const connection = new autobahn.Connection({ url, realm });

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

/**
 * 2. Register to dyndns every interval
 * ====================================
 *
 * Watch for IP changes, if so update the IP. On error, asume the IP changed.
 * If the user has not defined a static IP use dynamic DNS
 * > staticIp is set in `initializeApp.js`
 *
 * DynDNS interval check
 * If the static is not defined, register and update the DynDNS registry
 *
 * Before doing so, it will check if it is actually necessary:
 * 1. Get its own IP and check if has changed from its internal DB record
 *    - If UPNP is available fetch the IP from there
 *    - Otherwise, fetch the IP from a centralized source
 * 2. Query the DynDNS and check if the record matches the server's IP
 *
 * [NOTE] On the first run the DNS lookup will fail and that will trigger the update
 *
 * If all queries were successful and all looks great skip update.
 * On any doubt, update the IP
 */
const publicIpCheckInterval = 30 * 60 * 1000; // 30 minutes

setIntervalAndRun(async () => {
  try {
    if (!(await db.get("staticIp")))
      await dyndnsClient.checkIpAndUpdateIfNecessary();
  } catch (e) {
    logs.error(`Error on dyndns interval: ${e.stack || e.message}`);
  }
}, publicIpCheckInterval);

/**
 * 3. Log debug info
 * =================
 *
 * - Print db for debugging
 * - Write loginMsg:
 *   The following code generates a text file with the message to be printed out
 *   for the user to connect to DAppNode. It contains the information to print and
 *   also serves as flag to signal the end of the initialization
 */

db.get().then(_db => {
  logs.info(JSON.stringify(_db, null, 2));
});
