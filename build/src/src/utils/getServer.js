const db = require('../db');

async function getServer() {
    // Server can be
    // staticIp
    // domain
    // ip
    const staticIp = await db.get('staticIp');
    const domain = await db.get('domain');
    const ip = await db.get('ip');
    return staticIp || domain || ip;
}

module.exports = getServer;
