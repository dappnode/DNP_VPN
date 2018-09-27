const exec = require('child_process').exec;

function createCheckHostResolution(fetchVPNparameters) {
  return async function statusUPnP() {
    // Check availability of UPnP
    await runUpnpScript();
    const params = await fetchVPNparameters();
    if (!('IP' in params && 'EXT_IP' in params && 'INT_IP' in params)) {
      throw Error('Necessary credentials not found in params object');
    }

    const externalIpResolves = checkHost(params);

    return {
      message: 'externalIpResolves '+JSON.stringify(externalIpResolves),
      result: externalIpResolves,
    };
  };
}


// const getStatus = (VPN) => {
//   const {IP, EXT_IP, INT_IP} = VPN;

//   if (EXT_IP && EXT_IP.length) {return ({
//     openPorts: true,
//     UPnP: true,
//     msg: 'UPnP device available',
//   });}

//   else if (
//     INT_IP && INT_IP.length
//     && IP && IP.length
//     && INT_IP === IP
//   ) {return ({
//     openPorts: false,
//     UPnP: true,
//     msg: 'Cloud service',
//   });}

//   else {return ({
//     openPorts: true,
//     UPnP: false,
//     msg: 'UPnP not available. Turn it on or open ports manually',
//   });}
// };

const runUpnpScript = () => {
  return new Promise((resolve, reject) => {
    const cmd = './check_upnp.sh';
    exec(cmd, (error) => {
      if (error) return reject(error);
      return resolve();
    });
  });
};

const ping = (host, method) => {
    return new Promise((resolve, reject) => {
        let cmd;
        if (method == 'ping') cmd = 'ping -c 20 '+host;
        if (method == 'nc') cmd = 'nc -vzu '+host+' 500';
        exec(cmd, (error) => {
            if (error) return reject(error);
            return resolve();
        });
    });
};

const checkHost = async (host) => {
  for (let i=0; i<10; i++) {
    let res = await ping(host, 'ping').then(() => true, () => false);
    if (res) return true;
  }
  return false;
};


module.exports = createCheckHostResolution;
