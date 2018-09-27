const fs = require('fs');
const logs = require('../logs.js')(module);

// Just for debugging purposes
let attempts = 0;

const externalIpStatusPath =
  process.env.DEV ? './test/external-ip_status' : process.env.EXTERNAL_IP_STATUS_PATH;

function getExternalIpStatus(ip, externalIp, internalIp, publicIpResolved) {
    const externalIpStatus = getStatus(ip, externalIp, internalIp, publicIpResolved);
    // write to file
    fs.writeFileSync(
        externalIpStatusPath,
        JSON.stringify(externalIpStatus),
        'utf8'
    );
    return externalIpStatus;
}

const getStatus = (ip, externalIp, internalIp, publicIpResolved) => {
    // Case 1:
    if (!ip === '' && ip === internalIp) {
      return {
        externalIpResolves: true,
      };
    }

    // Case 2:
    let _ip;
    if (externalIp || !externalIp === '') _ip = externalIp;
    else if (ip || !ip === '') _ip = ip;
    else {
      // Wierd case, don't deal with it yet
      return {
        externalIpResolves: true,
      };
    }


    let externalIpResolves;
    if (publicIpResolved == '0') externalIpResolves = false;
    else if (publicIpResolved == '1') externalIpResolves = true;
    else logs.warn('PUBLIC_IP_RESOLVED has a wrong format: '+publicIpResolved);

    return {
      externalIpResolves,
      attempts,
      internalIp,
      externalIp: _ip,
    };
};


module.exports = getExternalIpStatus;
