const getUserList = require("../utils/getUserList");
const getCCD = require("../utils/getCCD");

/**
 * Returns a list of the existing devices, with the admin property
 *
 * @param {Object} kwargs: {}
 * @return {Object} A formated success message.
 * result:
 *
 *   [
 *     {
 *       id, <String>
 *       admin, <Boolean>
 *     },
 *     ...
 *   ]
 */
async function listDevices() {
  const userList = await getUserList();
  const ccd = await getCCD();
  let deviceList = [];

  userList.forEach(user => {
    deviceList.push({
      id: user,
      admin: ccd.some(obj => obj.cn === user),
      ip: ""
    });
  });

  return {
    message: `Listing ${deviceList.length} devices`,
    logMessage: true,
    result: deviceList
  };
}

module.exports = listDevices;
