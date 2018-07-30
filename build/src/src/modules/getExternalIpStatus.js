const exec = require('child_process').exec;
const fs = require('fs');
const logs = require('../logs.js')(module);

// Just for debugging purposes
let attempts = 0;

const EXTERNALIP_STATUS_FILE_PATH =
  process.env.DEV ? './test/external-ip_status' : process.env.EXTERNALIP_STATUS_FILE_PATH;

async function getExternalIpStatus(IP, EXT_IP, INT_IP) {
    const externalIpStatus = await getStatus(IP, EXT_IP, INT_IP);
    // write to file
    fs.writeFileSync(
        EXTERNALIP_STATUS_FILE_PATH,
        JSON.stringify(externalIpStatus),
        'utf8'
    );
}

const getStatus = async (IP, EXT_IP, INT_IP) => {
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
      return {
        externalIpResolves: true,
      };
    }
      // Wierd case, don't deal with it yet

    // Case 3:
    const externalIpResolves = await checkHost(_IP);

    return {
      externalIpResolves,
      attempts,
      INT_IP: INT_IP,
      EXT_IP: _IP,
    };
};

const checkHost = async (host) => {
  for (let i=0; i<1; i++) {
    attempts = i;
    let res = await ping(host, 'ping').then(() => true, () => false);
    if (res) return true;
  }
  return false;
};

const ping = (host, method) => {
  logs.info('Pinging host: '+host);
  return new Promise((resolve, reject) => {
    let cmd;
    if (method == 'ping') cmd = 'ping -c 100 '+host;
    if (method == 'nc') cmd = 'nc -vzu '+host+' 500';
    exec(cmd, (error) => {
      if (error) return reject(error);
      return resolve();
    });
  });
};

module.exports = getExternalIpStatus;
