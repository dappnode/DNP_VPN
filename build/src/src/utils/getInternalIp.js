const shell = require('./shell');
const getVpnImage = require('./getVpnImage');

/* eslint-disable max-len */

async function getInternalIp() {
    try {
        const vpnImage = await getVpnImage();
        const output = await shell('docker run --rm --net=host '+vpnImage+' ip route get 1', {trim: true});
        // A unicode escape sequence is basically atomic. You cannot really build one dynamically
        // Template literals basically perform string concatenation, so your code is equivalent to
        // FROM: 1.0.0.0 via 104.248.144.1 dev eth0 src 104.248.150.201 uid 0
        // TO: 104.248.150.201
        return ((output || '').match(/src\s((\d+\.?){4})/) || [])[1];
    } catch (e) {
        e.message = `Error getting internal IP: ${e.message}`;
        throw e;
    }
}

module.exports = getInternalIp;
