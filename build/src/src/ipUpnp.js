const shell = require('./utils/shell');
const ping = require('./utils/ping');
const db = require('./db');
const logs = require('./logs.js')(module);

/* eslint-disable max-len */

async function ipUpnp() {
    // Define variables
    let vpnImage; let externalIp; let internalIp; let digIp;

    // Get image to do UPnP calls
    try {
        // the "image" output may contain a newline character. To avoid the next command to fail, trim image
        vpnImage = await shell(`docker inspect DAppNodeCore-vpn.dnp.dappnode.eth -f '{{.Config.Image}}'`, {trim: true});
    } catch (e) {
        logs.error(`Error getting VPN image to do UPnP calls: ${e.stack}`);
    }

    if (vpnImage) {
        // Get external IP
        try {
            externalIp = await shell('docker run --rm --net=host '+vpnImage+' upnpc -l', {trim: true})
                .then((output = '') => (output.match(/ExternalIPAddress.=.((\d+\.?){4})/) || [])[1]);
        } catch (e) {
            logs.error(`Error getting External IP: ${e.stack}`);
        }

        // Get internal IP
        try {
            // A unicode escape sequence is basically atomic. You cannot really build one dynamically
            // Template literals basically perform string concatenation, so your code is equivalent to
            // FROM: 1.0.0.0 via 104.248.144.1 dev eth0 src 104.248.150.201 uid 0
            // TO: 104.248.150.201
            internalIp = await shell('docker run --rm --net=host '+vpnImage+' ip route get 1', {trim: true})
                .then((output = '') => (output.match(/src\s((\d+\.?){4})/) || [])[1]);
        } catch (e) {
            logs.error(`Error getting Internal IP: ${e.stack}`);
        }
    }

    // DIG checkin in the future we want to remove this centralization point
    try {
        digIp = await shell(`dig @resolver1.opendns.com -t A -4 myip.opendns.com +short`, {trim: true});
    } catch (e) {
        logs.error(`Error getting public IP with dig: ${e.stack}`);
    }

    let publicIp;
    if (!digIp) {
        publicIp = externalIp || internalIp;
    } else if (!externalIp) {
        // If interal and dig is the same directly exposed to internet
        // If is different we use the dig resolution
        publicIp = internalIp === digIp ? internalIp : digIp;
    } else if (internalIp === digIp) {
        // If both IP are the same every thing is OK
        publicIp = externalIp;
    } else {
        // In case of doubt we use the IP resolution through dig
        publicIp = digIp;
    }

    // Test PUBLIC_IP resolution
    const publicIpResolved = await ping(publicIp);

    // Export variables to the db
    await db.set('internalIp', internalIp);
    await db.set('externalIp', externalIp);
    await db.set('publicIpResolved', publicIpResolved);
}

module.exports = ipUpnp;
