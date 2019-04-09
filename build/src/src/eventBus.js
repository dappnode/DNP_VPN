const EventEmitter = require("events");
const logs = require("./logs")(module);

/** HOW TO:
 * - ON:
 * eventBus.on(eventBusTag.logUI, (data) => {
 *   doStuff(data);
 * });
 *
 * - EMIT:
 * eventBus.emit(eventBusTag.logUI, data);
 */
class MyEmitter extends EventEmitter {}

const eventBus = new MyEmitter();

const eventBusTag = {
  emitDevices: "EMIT_DEVICES"
};

// Offer a default mechanism to run listeners within a try/catch block
eventBus.onSafe = (eventName, listener, options = {}) => {
  if (options.isAsync) {
    eventBus.on(eventName, async (...args) => {
      try {
        await listener(...args);
      } catch (e) {
        logs.error(`Error on event '${eventName}': ${e.stack}`);
      }
    });
  } else {
    eventBus.on(eventName, (...args) => {
      try {
        listener(...args);
      } catch (e) {
        logs.error(`Error on event '${eventName}': ${e.stack}`);
      }
    });
  }
};

module.exports = {
  eventBus,
  eventBusTag
};
