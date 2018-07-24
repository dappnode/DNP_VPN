const exec = require('child_process').exec;

// Just for debugging purposes
let attempts = 0;

function createStatusExternalIp(params) {
  return async function statusExternalIp() {
    // Check availability of UPnP
    const VPN = params.VPN;
    if (!('IP' in VPN && 'EXT_IP' in VPN && 'INT_IP' in VPN)) {
      throw Error('Necessary credentials not found in params object');
    }


    if (!VPN.IP === '' && VPN.IP === VPN.INT_IP) {
      return {
        message: 'External IP status ',
        result: {externalIpResolves: true},
      };
    }

    let IP;
    if (VPN.EXT_IP || !VPN.EXT_IP === '') IP = VPN.EXT_IP;
    else if (VPN.IP || !VPN.IP === '') IP = VPN.IP;
    else {
      return {
        message: 'External IP status ',
        result: {externalIpResolves: true},
      };
    }
      // Wierd case, don't deal with it yet

    const externalIpResolves = await checkHost(IP);

    const externalIpStatus = {
      externalIpResolves,
      attempts,
      INT_IP: VPN.INT_IP,
      EXT_IP: IP,
    };

    return {
      message: 'External IP status ',
      result: externalIpStatus,
    };
  };
}

const checkHost = async (host) => {
  for (let i=0; i<10; i++) {
    attempts = i;
    let res = await ping(host, 'ping').then(() => true, () => false);
    if (res) return true;
  }
  return false;
};

const ping = (host, method) => {
    return new Promise((resolve, reject) => {
        let cmd;
        if (method == 'ping') cmd = 'ping -c 10 '+host;
        if (method == 'nc') cmd = 'nc -vzu '+host+' 500';
        exec(cmd, (error) => {
            if (error) return reject(error);
            return resolve();
        });
    });
};

module.exports = createStatusExternalIp;
