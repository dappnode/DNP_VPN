const fs = require("fs");
const path = require("path");
const getCCD = require("../utils/getCCD");
const getUserList = require("../utils/getUserList");
const getLowestIP = require("../utils/getLowestIP");

const ccdPath = process.env.DEV ? "./mockFiles/ccd" : "/etc/openvpn/ccd";
const ccdMask = "255.255.252.0";
const masterAdmin = "dappnode_admin";

/**
 * Gives/removes admin rights to the provided device id.
 *
 * @param {Object} kwargs: {id}
 * @return {Object} A formated success message.
 * result: empty
 */
async function toggleAdmin({ id }) {
  const devices = await getUserList();
  if (!devices.includes(id)) {
    throw Error(`Device not found: ${id}`);
  }

  const ccdArray = getCCD();
  const isAdmin = ccdArray.find(c => c.cn === id);

  if (id === masterAdmin) {
    throw Error("You cannot remove the master admin user");
  } else if (isAdmin) {
    try {
      fs.unlinkSync(path.join(ccdPath, id));
    } catch (err) {
      throw Error(`Failed to remove ccd from: ${id}`);
    }
  } else {
    const ccdContent = `ifconfig-push ${getLowestIP(ccdArray)} ${ccdMask}\r\n`;
    fs.writeFileSync(path.join(ccdPath, id), ccdContent);
  }
}

module.exports = toggleAdmin;
