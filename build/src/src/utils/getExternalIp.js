const shell = require('./shell');
const getVpnImage = require('./getVpnImage');

/* eslint-disable max-len */

async function getExternalIp() {
    try {
        const vpnImage = await getVpnImage();
        const output = await shell('docker run --rm --net=host '+vpnImage+' upnpc -l', {trim: true});
        return ((output || '').match(/ExternalIPAddress.=.((\d+\.?){4})/) || [])[1];
    } catch (e) {
        e.message = `Error getting external IP: ${e.message}`;
        throw e;
    }
}

module.exports = getExternalIp;
