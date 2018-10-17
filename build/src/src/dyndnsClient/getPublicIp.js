const httpGetRequest = require('./httpGetRequest');
const logs = require('../logs.js')(module);

const publicIpUrl = process.env.PUBLIC_IP_URL || 'https://ipv4.icanhazip.com';

function getPublicIp() {
    return httpGetRequest(publicIpUrl, {format: 'text'}).then((res) => {
        const data = res.data || {};
        // Deal with the answer
        // Sample res:
        // res.data = '80.42.123.41' <plain text string>

        if (res.code === 200) {
            const ip = data.trim();
            return ip;
        } else {
            logs.error(`Error getting public IP, error code ${res.code || 'no-code'}: ${data}`);
        }
    }).catch((err) => {
        logs.error(`httpGetRequest error: ${err.stack || err.message}`);
    });
}

module.exports = getPublicIp;


