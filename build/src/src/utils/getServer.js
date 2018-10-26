const db = require('../db');

function getServer() {
    const _db = db.get();
    // Server can be
    // staticIp
    // domain
    // ip
    const staticIp = _db.staticIp;
    const domain = _db.domain;
    const ip = _db.ip;
    return staticIp || domain || ip;
}

module.exports = getServer;
