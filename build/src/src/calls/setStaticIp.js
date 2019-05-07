const db = require("../db");
const dyndnsClient = require("../dyndnsClient");
const { eventBus, eventBusTag } = require("../eventBus");

/**
 * Sets the static IP
 *
 * @param {(string|null)} staticIp New static IP
 * - To enable: "85.84.83.82"
 * - To disable: null
 */
async function setStaticIp({ staticIp }) {
  const oldStaticIp = await db.get("staticIp");
  await db.set("staticIp", staticIp);

  // Parse action to display a feedback message
  let message;
  if (!oldStaticIp && staticIp) {
    message = `Enabled static IP: ${staticIp}`;
  } else if (oldStaticIp && !staticIp) {
    await dyndnsClient.updateIp();
    message = `Disabled static IP, and registered to dyndns: ${await db.get(
      "domain"
    )}`;
  } else {
    message = `Updated static IP: ${staticIp}`;
  }

  // Emit packages update
  eventBus.emit(eventBusTag.emitDevices);

  return {
    message,
    logMessage: true,
    userAction: true
  };
}

module.exports = setStaticIp;
