const buildClient = require("../utils/buildClient");
const removeClient = require("../utils/removeClient");

/**
 * Regenerates the credentials of the specified device.
 *
 * @param {Object} kwargs: {id}
 * @return {Object} A formated success message.
 * result: empty
 */
async function resetDevice({ id }) {
  if (id === "") {
    throw Error("The device name cannot be empty");
  }

  await removeClient(id);
  await buildClient(id);

  return {
    message: `Reseted device: ${id}`,
    logMessage: true,
    userAction: true
  };
}

module.exports = resetDevice;
