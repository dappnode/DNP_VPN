const EventEmitter = require('events');

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
    emitDevices: 'EMIT_DEVICES',
};

module.exports = {
    eventBus,
    eventBusTag,
};
