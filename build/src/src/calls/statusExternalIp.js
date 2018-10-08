const db = require('../db');

async function statusExternalIp() {
    return {
        result: {
            externalIpResolves: db.get('externalIpResolves').value(),
            externalIp: db.get('externalIp').value(),
            internalIp: db.get('internalIp').value(),
        },
    };
}

module.exports = statusExternalIp;
