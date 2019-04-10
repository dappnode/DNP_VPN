const autobahn = require("autobahn");
const logs = require("./logs.js")(module);
const db = require("./db");
const { eventBus, eventBusTag } = require("./eventBus");
// Modules
const dyndnsClient = require("./dyndnsClient");
// Scripts
const openPorts = require("./openPorts");
// Utils
const getExternalUpnpIp = require("./utils/getExternalUpnpIp");
const getPublicIpFromUrls = require("./utils/getPublicIpFromUrls");
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
 */
const publicIpCheckInterval = 30 * 60 * 1000;

let _ip = "";
setIntervalAndRun(async () => {
  try {
    // If the static IP is defined, skip registering to dyndns
    if (await db.get("staticIp")) return;
    // Otherwise, obtain the public IP from UPnP or a provider and register
    let ip;
    if (await db.get("upnpAvailable")) ip = await getExternalUpnpIp();
    if (!ip) ip = await getPublicIpFromUrls();
    if (!ip || ip !== _ip) {
      await dyndnsClient.updateIp();
      _ip = ip;
    }
    if (ip) await db.set("ip", ip);
  } catch (e) {
    logs.error(`Error on dyndns interval: ${e.stack || e.message}`);
  }
}, publicIpCheckInterval);

/**
 * 3. Open ports if UPnP is available
 * ==================================
 *
 * `upnpAvailable` is set in `initializeApp.js`.
 * If UPnP is available the openPorts functions calls UPnP sequentially to
 * open all ports declared in its object.
 */

db.get("upnpAvailable").then(upnpAvailable => {
  if (upnpAvailable) {
    openPorts()
      .then(() => logs.info("Open ports script - Successfully completed"))
      .catch(e => logs.error(`Open ports script - Error: ${e.stack}`));
  } else {
    logs.info("Open ports script - skipping, UPnP is not available");
  }
});

/**
 * 4. Log debug info
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
