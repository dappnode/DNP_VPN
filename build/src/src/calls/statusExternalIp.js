const db = require('../db');

async function statusExternalIp() {
    const _db = db.get();
    return {
        result: {
            externalIpResolves: _db.externalIpResolves,
            externalIp: _db.externalIp,
            internalIp: _db.internalIp,
        },
    };
}

module.exports = statusExternalIp;
