const db = require('./db');
// Modules
const dyndnsClient = require('./dyndnsClient');
// Utils
const getServerName = require('./utils/getServerName');
const getInternalIp = require('./utils/getInternalIp');
const getStaticIp = require('./utils/getStaticIp');
const getExternalUpnpIp = require('./utils/getExternalUpnpIp');
const getPublicIpFromUrls = require('./utils/getPublicIpFromUrls');
const ping = require('./utils/ping');

/* eslint-disable max-len */

initializeApp();

async function initializeApp() {
    // 1. Directly connected to the internet: Public IP is the interface IP
    // 2. Behind a router: Needs to get the public IP, open ports and get the internal IP
    // 2A. UPnP available: Get public IP without a centralize service. Can open ports
    // 2B. No UPnP: Open ports manually, needs a centralized service to get the public IP
    // 2C. No NAT-Loopback: Public IP can't be resolved within the same network. User needs 2 profiles

    // Check if the static IP is set. If so, don't use any centralized IP-related service
    // The publicIp will be obtained in the entrypoint.sh and exported as PUBLIC_IP
    const staticIp = await getStaticIp();
    const intenalIp = await getInternalIp();
    // If the host is exposed to the internet and the staticIp is set, avoid calling UPnP
    const externalIp = staticIp && staticIp === intenalIp && await getExternalUpnpIp();
    const publicIp = staticIp || externalIp || await getPublicIpFromUrls();
    const behindRouter = intenalIp !== publicIp;
    const upnpAvailable = Boolean(behindRouter && externalIp);
    const noNatLoopback = Boolean(behindRouter && !(await ping(publicIp)));
    const alertUserToOpenPorts = Boolean(behindRouter && !upnpAvailable);

    await db.set('ip', publicIp);
    await db.set('psk', process.env.PSK);
    await db.set('name', await getServerName());
    await db.set('upnpAvailable', upnpAvailable);
    await db.set('noNatLoopback', noNatLoopback);
    await db.set('alertToOpenPorts', alertUserToOpenPorts);
    await db.set('internalIp', intenalIp);

    // Create VPN's address + publicKey + privateKey if it doesn't exist yet (with static ip or not)
    // - Verify if the privateKey is corrupted or lost. Then create a new identity and alert the user
    // - Updates the domain: db.set('domain', domain)
    await dyndnsClient.generateKeys();
}
