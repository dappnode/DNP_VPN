const httpGetRequest = require('./httpGetRequest');
const logs = require('../logs.js')(module);

const publicIpUrl = 'https://ipv4.icanhazip.com';


// What to do if icanhazip goes down?

function getPublicIp() {
    return httpGetRequest(publicIpUrl, {format: 'text'}).then((res) => {
        const data = res.data || {};
        // Deal with the answer
        // Sample res:
        // res.data = {
        //     'ip': '63.84.220.164',
        //     'domain': '2dc4e4f6.dyndns.greyfaze.net',
        //     'message': 'Your dynamic domain 2dc4e4f6.dyndns.greyfaze.net
        //          has been updated to 63.84.220.164',
        // };
        if (res.code === 200) {
            const IP = data.trim();
            return IP;
        } else {
            logs.error(`Error getting public IP, error code ${res.code || 'no-code'}: ${data}`);
        }
    }).catch((err) => {
        logs.error(`httpGetRequest error: ${err.stack || err.message}`);
    });
}

module.exports = getPublicIp;


