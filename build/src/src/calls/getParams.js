const db = require('../db');

async function getParams() {
    return {
        result: {
            ip: db.get('ip').value(),
            name: db.get('name').value(),
        },
    };
}

module.exports = getParams;
