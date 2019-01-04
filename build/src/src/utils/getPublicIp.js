const shell = require('./shell');
const isIp = require('is-ip');
const logs = require('../logs.js')(module);

/* eslint-disable max-len */

const urls = [
    'https://ns.dappnode.io/myip',
    'http://ipv4.icanhazip.com',
    'http://ident.me',
];

/**
 * Implements a custom race control flow to get the public IP:
 * - First url to reply a valid IP will resolve the promise
 * - If the first url to replies an invalid IP, it is ignored
 * - If all urls have replied invalid IPs, then an error is returned
 *
 * @param {Boolean} silent suppress logs
 * @return {String} public IP: 85.84.83.82
 */
function getPublicIp(silent) {
    return new Promise(async (resolve, reject) => {
        let foundValidIp;
        let lastError;
        await Promise.all(urls.map(async (url) => {
            // wget
            // -t: tries 3 times
            // -T: timeout after 15 seconds
            // -q: quiet, suppress all output except the IP
            // O-: output ?
            const ip = await shell(`wget -t 3 -T 15 -qO- ${url}`, {trim: true})
                .catch((e) => {
                    lastError = `Error getting IP from ${url}: ${e.message}`;
                    if (!silent) logs.error(lastError);
                });
            if (isIp(ip)) resolve(foundValidIp = ip);
        }));
        if (!foundValidIp) reject(Error(`No valid IP was returned by urls: ${urls.join(', ')}. ${lastError ? `Last error: ${lastError.trim()}` : ''}`));
    });
}

module.exports = getPublicIp;
