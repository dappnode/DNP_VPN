const shell = require("./shell");
const getVpnImage = require("./getVpnImage");
const logs = require("../logs.js")(module);
const isIp = require("is-ip");

async function getExternalUpnpIp({ silent } = {}) {
  try {
    const vpnImage = await getVpnImage();
    const output = await shell(
      `docker run --rm --net=host ${vpnImage} upnpc -l`,
      { trim: true }
    );
    const externalIp = ((output || "").match(
      /ExternalIPAddress.=.((\d+\.?){4})/
    ) || [])[1];
    return isIp(externalIp) ? externalIp : null;
  } catch (e) {
    if (!silent) logs.error(`Error getting external IP: ${e.message}`);
  }
}

module.exports = getExternalUpnpIp;
