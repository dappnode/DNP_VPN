const shell = require("../utils/shell");

const fetchCredsCommand = "/usr/local/bin/ovpn_getclient";

async function getClient(id) {
  let res;
  try {
    res = await shell(`${fetchCredsCommand} ${id}`);
  } catch (err) {
    throw Error(`Error retrieving client ${id}:`, err);
  }
  return res;
}

module.exports = getClient;
