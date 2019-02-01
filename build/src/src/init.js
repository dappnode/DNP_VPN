const db = require('./db');
const logs = require('./logs.js')(module);
const crypto = require('crypto');
const fs = require('fs');
// Modules
const dyndnsClient = require('./dyndnsClient');
const migrateOldUsers = require('./migrateOldUsers');
// Utils
const getServerName = require('./utils/getServerName');
const getInternalIp = require('./utils/getInternalIp');
const getStaticIp = require('./utils/getStaticIp');
const getExternalUpnpIp = require('./utils/getExternalUpnpIp');
const getPublicIpFromUrls = require('./utils/getPublicIpFromUrls');
const ping = require('./utils/ping');
const shell = require('./utils/shell');

throw Error('This script is a WIP, should not be imported');

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

    // Generate salt
    if (await db.get('salt')) {
        logs.info('Salt is already generated, skipping its generation');
    } else {
        const salt = crypto.randomBytes(8).toString('hex');
        await db.set('salt', salt);
        logs.info(`Successfully generated salt of 8 bytes: ${salt}`);
    }

    // //////////////////
    // js port of init.sh
    // //////////////////

    const {
        OPENVPN_CONF,
        OPENVPN_ADMIN_PROFILE,
        OPENVPN_CCD_DIR,
        DEFAULT_ADMIN_USER,
    } = process.env;

    // Initialize config and PKI
    // -c: Client to Client
    // -d: disable default route (disables NAT without '-N')
    // -p "route 172.33.0.0 255.255.0.0": Route to push to the client
    if (!fs.existsSync(OPENVPN_CONF)) {
        await shell(`ovpn_genconfig -c -d -u udp://${publicIp} -s 172.33.8.0/22 -p "route 172.33.0.0 255.255.0.0" -n "172.33.1.2" EASYRSA_REQ_CN=${publicIp} ovpn_initpki nopass`);
    }

    // Create admin user
    if (!fs.existsSync(OPENVPN_ADMIN_PROFILE)) {
        vpncli.add(DEFAULT_ADMIN_USER);
        vpncli.get(DEFAULT_ADMIN_USER);
        await shell(`echo "ifconfig-push 172.33.10.20 172.33.10.254" > ${OPENVPN_CCD_DIR}/${DEFAULT_ADMIN_USER}`);
    }

    // Enable Proxy ARP (needs privileges)
    await shell(`echo 1 > /proc/sys/net/ipv4/conf/eth0/proxy_arp`);

    // Migrate users from v1
    await migrateOldUsers();

    // Save environment
    await shell(`env | sed '/affinity/d' > /etc/env.sh`);
}
