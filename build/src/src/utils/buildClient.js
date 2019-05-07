const shell = require("../utils/shell");

async function buildClient(id) {
  let res;
  try {
    res = await shell(`easyrsa build-client-full ${id} nopass`);
  } catch (err) {
    throw Error("Error building client:", err);
  }
  return res;
}

module.exports = buildClient;
