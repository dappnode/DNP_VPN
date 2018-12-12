const db = require('../db');

async function getParams() {
    const _db = await db.get();
    const result = {
        ip: _db.ip,
        name: _db.name,
    };
    const staticIp = _db.staticIp;
    const domain = _db.domain;
    if (staticIp) {
        result.staticIp = staticIp;
    } else {
        result.domain = domain;
    }
    return {
        result,
    };
}

module.exports = getParams;
