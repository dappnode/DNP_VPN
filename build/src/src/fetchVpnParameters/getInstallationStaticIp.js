const fs = require('file-system');
const {promisify} = require('util');
const readFileAsync = promisify(fs.readFile);
const logs = require('../logs.js')(module);
const ipRegex = require('ip-regex');

const {INSTALLATION_STATIC_IP} = process.env;

/* eslint-disable max-len */

function getInstallationStaticIp() {
    return readFileAsync(INSTALLATION_STATIC_IP, 'utf-8')
    .then((data) => String(data).trim())
    // If the file is empty return null
    .then((data) => data.length ? data : null)
    .then((ip) => {
        if (ipRegex({exact: true}).test(ip)) return ip;
        else return null;
    })
    .catch((err) => {
        if (err.code === 'ENOENT') {
            logs.warn(`INSTALLATION_STATIC_IP file not found at ${INSTALLATION_STATIC_IP}: ${err.stack || err.message}`);
        } else {
            logs.error(`Error reading INSTALLATION_STATIC_IP ${INSTALLATION_STATIC_IP}: ${err.stack || err.message}`);
        }
        return null;
    });
}

module.exports = getInstallationStaticIp;
