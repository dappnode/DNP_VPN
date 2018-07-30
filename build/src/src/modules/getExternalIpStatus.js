const fs = require('fs');
const logs = require('../logs.js')(module);

// Just for debugging purposes
let attempts = 0;

const EXTERNALIP_STATUS_FILE_PATH =
  process.env.DEV ? './test/external-ip_status' : process.env.EXTERNALIP_STATUS_FILE_PATH;

function getExternalIpStatus(IP, EXT_IP, INT_IP, PUBLIC_IP_RESOLVED) {
    const externalIpStatus = getStatus(IP, EXT_IP, INT_IP, PUBLIC_IP_RESOLVED);
    // write to file
    fs.writeFileSync(
        EXTERNALIP_STATUS_FILE_PATH,
        JSON.stringify(externalIpStatus),
        'utf8'
    );
    return externalIpStatus;
}

const getStatus = (IP, EXT_IP, INT_IP, PUBLIC_IP_RESOLVED) => {
    // Case 1:
    if (!IP === '' && IP === INT_IP) {
      return {
        externalIpResolves: true,
      };
    }

    // Case 2:
    let _IP;
    if (EXT_IP || !EXT_IP === '') _IP = EXT_IP;
    else if (IP || !IP === '') _IP = IP;
    else {
      // Wierd case, don't deal with it yet
      return {
        externalIpResolves: true,
      };
    }


    let externalIpResolves;
    if (PUBLIC_IP_RESOLVED == '0') externalIpResolves = false;
    else if (PUBLIC_IP_RESOLVED == '1') externalIpResolves = true;
    else logs.warn('PUBLIC_IP_RESOLVED has a wrong format: '+PUBLIC_IP_RESOLVED);

    return {
      externalIpResolves,
      attempts,
      INT_IP: INT_IP,
      EXT_IP: _IP,
    };
};


module.exports = getExternalIpStatus;
