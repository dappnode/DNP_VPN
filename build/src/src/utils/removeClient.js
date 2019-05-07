const shell = require("../utils/shell");
const fs = require("fs");

const revokeCommand = "/usr/local/bin/ovpn_revokeclient";

async function removeClient(id) {
  try {
    // Revoke first to save in CRL
    await shell(`${revokeCommand} ${id}`);
    // Remove all client associated files
    await Promise.all([
      fs.unlinkSync(`${process.env.OPENVPN}/pki/private/${id}.key`),
      fs.unlinkSync(`${process.env.OPENVPN}/pki/reqs/${id}.req`),
      fs.unlinkSync(`${process.env.OPENVPN}/pki/issued/${id}.crt`)
    ]);
  } catch (err) {
    throw Error(`Error removing device ${id}: ${err}`);
  }
}

module.exports = removeClient;
