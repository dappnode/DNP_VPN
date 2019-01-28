const getStaticIp = require('./getStaticIp');
const getExternalIp = require('./getExternalIp');
const getPublicIpFromUrls = require('./getPublicIpFromUrls');
const logs = require('../logs.js')(module);

/* eslint-disable max-len */

async function getPublicIp() {
    try {
        const ip = await getStaticIp().catch((e) => {
            logs.error(`Error getting static IP. Error: ${e.stack}`);
        }) || await getExternalIp().catch((e) => {
            logs.info(`Could not get external IP from UPnP, will default to use URL sources. Error: ${e.message}`);
        }) || await getPublicIpFromUrls();
        if (!ip) throw Error('IP is empty or undefined');
        else return ip;
    } catch (e) {
        logs.error(`Error getting public IP: ${e.stack}`);
    }
}

module.exports = getPublicIp;
