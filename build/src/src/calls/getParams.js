const db = require('../db');

async function getParams() {
    const result = {
        ip: db.get('ip').value(),
        name: db.get('name').value(),
    };
    const staticIp = db.get('staticIp').value();
    const domain = db.get('domain').value();
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
