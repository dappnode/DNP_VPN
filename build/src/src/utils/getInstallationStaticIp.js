const fs = require('file-system');
const {promisify} = require('util');
const readFileAsync = promisify(fs.readFile);
const logs = require('../logs.js')(module);

const {INSTALLATION_STATIC_IP} = process.env;

/* eslint-disable max-len */

function getInstallationStaticIp() {
    return readFileAsync(INSTALLATION_STATIC_IP, 'utf-8')
    .then((data) => String(data).trim())
    // If the file is empty return null
    .then((data) => data.length ? data : null)
    .catch((err) => {
        logs.error(`Error reading INSTALLATION_STATIC_IP ${INSTALLATION_STATIC_IP}: ${err.stack || err.message}`);
        return null;
    });
}

module.exports = getInstallationStaticIp;
