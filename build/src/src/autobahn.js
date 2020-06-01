const autobahn = require("autobahn");
const logs = require("./logs.js")(module);
const { eventBus, eventBusTag } = require("./eventBus");
const registerHandler = require("./utils/registerHandler");
const calls = require("./calls");

/**
 * Setup crossbar connection
 *
 * Will register the VPN user managment node app to the the DAppNode's crossbar WAMP
 * It automatically registers all handlers exported in the calls/index.js file
 * Each handler is wrapped with a custom function to format its success and error messages
 */
module.exports = async function startAutobahn({ url, realm }) {
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
      registerHandler(
        session,
        callId + ".vpn.dnp.dappnode.eth",
        // Keep legacy format for backwards compatibility
        async (...args) => ({
          message: "",
          result: await calls[callId](...args)
        })
      );
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
        session.publish("devices.vpn.dnp.dappnode.eth", [devices]);
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
};
