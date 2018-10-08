const db = require('../db');

async function getParams() {
    return {
        result: {
            ip: db.get('ip').value(),
            name: db.get('name').value(),
            staticIp: db.get('staticIp').value(),
            domain: db.get('domain').value(),
        },
    };
}

module.exports = getParams;
