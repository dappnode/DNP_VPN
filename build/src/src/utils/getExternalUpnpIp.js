const shell = require('./shell');
const getVpnImage = require('./getVpnImage');
const logs = require('../logs.js')(module);

/* eslint-disable max-len */

async function getExternalUpnpIp({silent} = {}) {
    try {
        const vpnImage = await getVpnImage();
        const output = await shell('docker run --rm --net=host '+vpnImage+' upnpc -l', {trim: true});
        return ((output || '').match(/ExternalIPAddress.=.((\d+\.?){4})/) || [])[1];
    } catch (e) {
        if (!silent) logs.error(`Error getting external IP: ${e.message}`);
    }
}

module.exports = getExternalUpnpIp;
