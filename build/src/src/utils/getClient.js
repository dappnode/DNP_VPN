const shell = require("../utils/shell");

const fetchCredsCommand = "/usr/local/bin/ovpn_getclient";

async function getClient(id) {
  try {
    return await shell(`${fetchCredsCommand} ${id}`);
  } catch (err) {
    throw Error(`Error retrieving client ${id}: ${err.message}`);
  }
}

module.exports = getClient;
