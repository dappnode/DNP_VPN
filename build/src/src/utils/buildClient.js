const shell = require("../utils/shell");

async function buildClient(id) {
  try {
    return await shell(`easyrsa build-client-full ${id} nopass`);
  } catch (err) {
    throw Error(`Error building client: ${err.message}`);
  }
}

module.exports = buildClient;
