const db = require('../db');

async function statusUPnP() {
    return {
        result: {
            openPorts: db.get('openPorts').value(),
            upnpAvailable: db.get('name').value(),
        },
    };
}

module.exports = statusUPnP;
