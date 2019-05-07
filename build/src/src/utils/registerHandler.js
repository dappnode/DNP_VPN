const logs = require("../logs.js")(module);

function registerHandler(session, event, handler) {
  /*
   * Utilities to encode arguments to publish with the Crossbar format (args, kwargs)
   * - Publisher:
   *     publish("event.name", arg1, arg2)
   * - Subscriber:
   *     session.subscribe("event.name", args => {
   *       listener(...args)
   *     })
   */
  function publish(event, ...args) {
    // session.publish(topic, args, kwargs, options)
    session.publish(event, args);
  }

  const wrapErrors = handler =>
    async function(args, kwargs) {
      // 0. args: an array with call arguments
      // 1. kwargs: an object with call arguments
      // 2. details: an object which provides call metadata

      /**
       * Construct logger. The dappmanager stores the logs
       * and forwards them to the ADMIN UI
       * @param {object} userActionLog = {
       *   level: "info" | "error", {string}
       *   event: "installPackage.dnp.dappnode.eth", {string}
       *   message: "Successfully install DNP", {string} Returned message from the call function
       *   result: { data: "contents" }, {*} Returned result from the call function
       *   kwargs: { id: "dnpName" }, {object} RPC key-word arguments
       *   // Only if error
       *   message: e.message, {string}
       *   stack.e.stack {string}
       * }
       */
      const logToDappmanager = userActionLog => {
        publish("logUserActionToDappmanager", userActionLog);
      };

      try {
        const res = await handler(kwargs);

        // Log result
        logToDappmanager({ level: "info", event, ...res, kwargs });
        const eventShort = event.replace(".vpn.dnp.dappnode.eth", "");
        if (res.logMessage) {
          logs.info(`RPC ${eventShort} success: ${res.message}`);
        }

        return JSON.stringify({
          success: true,
          message: res.message || event,
          result: res.result || {}
        });
      } catch (e) {
        logs.error(`Error on ${event}: ${e.stack}`);
        logToDappmanager({ level: "error", event, ...error2obj(e), kwargs });

        return JSON.stringify({
          success: false,
          message: e.message
        });
      }
    };
  return session.register(event, wrapErrors(handler)).then(
    () => {
      logs.info(`Registered event: ${event}`);
    },
    e => {
      logs.error(`Error registering event ${event}: ${(e || {}).error}`);
    }
  );
}

const error2obj = e => ({
  name: e.name,
  message: e.message,
  stack: e.stack,
  userAction: true
});

module.exports = registerHandler;
