const shell = require("./shell");
const getVpnImage = require("./getVpnImage");
const isIp = require("is-ip");
const logs = require("../logs.js")(module);

async function getInternalIp({ silent } = {}) {
  try {
    const vpnImage = await getVpnImage();
    const output = await shell(
      `docker run --rm --net=host ${vpnImage} ip route get 1`,
      { trim: true }
    );
    // A unicode escape sequence is basically atomic. You cannot really build one dynamically
    // Template literals basically perform string concatenation, so your code is equivalent to
    // FROM: 1.0.0.0 via 104.248.144.1 dev eth0 src 104.248.150.201 uid 0
    // TO: 104.248.150.201
    const internalIp = ((output || "").match(/src\s((\d+\.?){4})/) || [])[1];
    return isIp(internalIp) ? internalIp : null;
  } catch (e) {
    if (!silent) logs.error(`Error getting internal IP: ${e.message}`);
  }
}

module.exports = getInternalIp;
