const { eventBus, eventBusTag } = require("../eventBus");
const buildClient = require("../utils/buildClient");
const getUserList = require("../utils/getUserList");
const userLimit = 500;

/**
 * Creates a new device with the provided id.
 * Generates certificates and keys needed for OpenVPN.
 *
 * @param {Object} kwargs: {id}
 * @return {Object} A formated success message.
 * result: empty
 */
async function addDevice({ id }) {
  if (id === "") {
    throw Error("The new device name cannot be empty");
  }
  if (
    (id || "").toLowerCase() === "guests" ||
    (id || "").toLowerCase() === "guest"
  ) {
    throw Error(
      `Please use the enable guests function to create a "Guest(s)" user`
    );
  }

  let userArray = await getUserList();

  if (userArray.length >= userLimit) {
    throw Error(`You have reached the maximum user limit (${userLimit})`);
  }

  if (!userArray.includes(id)) {
    await buildClient(id);
  } else {
    throw Error(`Device name exists: ${id}`);
  }

  // Emit devices update
  eventBus.emit(eventBusTag.emitDevices);

  return {
    message: `Added device: ${id}`,
    logMessage: true,
    userAction: true
  };
}

module.exports = addDevice;
