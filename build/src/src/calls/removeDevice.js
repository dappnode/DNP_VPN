const getUserList = require("../utils/getUserList");
const getCCD = require("../utils/getCCD");
const removeClient = require("../utils/removeClient");
const { eventBus, eventBusTag } = require("../eventBus");

/**
 * Removes the device with the provided id, if exists.
 *
 * @param {Object} kwargs: {id}
 * @return {Object} A formated success message.
 * result: empty
 */
async function removeDevice({ id }) {
  let deviceArray = await getUserList();
  let ccdArray = await getCCD();

  if (ccdArray.find(c => c.cn === id))
    throw Error("You cannot remove an admin user");

  if (!deviceArray.includes(id)) {
    throw Error(`Device name not found: ${id}`);
  } else {
    await removeClient(id);
  }

  eventBus.emit(eventBusTag.emitDevices);

  return {
    message: `Removed device: ${id}`,
    logMessage: true,
    userAction: true
  };
}

module.exports = removeDevice;
