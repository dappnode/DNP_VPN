const db = require('../db');

function getServer() {
    // Server can be
    // staticIp
    // domain
    // ip
    const staticIp = db.get('staticIp').value();
    const domain = db.get('domain').value();
    const ip = db.get('ip').value();
    return staticIp || domain || ip;
}

module.exports = getServer;
