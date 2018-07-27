const exec = require('child_process').exec;

function createStatusUPnP(params, fetchVPNparameters) {
  return async function statusUPnP() {
    // Check availability of UPnP
    await runUpnpScript();
    const VPN = await fetchVPNparameters();
    params.VPN = VPN;
    if (!('IP' in VPN && 'EXT_IP' in VPN && 'INT_IP' in VPN)) {
      throw Error('Necessary credentials not found in params object');
    }

    const status = getStatus(VPN);

    return {
      message: 'UPnP status ',
      result: status,
    };
  };
}


const getStatus = (VPN) => {
  const {IP, EXT_IP, INT_IP} = VPN;

  if (EXT_IP && EXT_IP.length) {
    return ({
      openPorts: true,
      UPnP: true,
      msg: 'UPnP device available',
    });
  }

  else if (
    INT_IP && INT_IP.length
    && IP && IP.length
    && INT_IP === IP
  ) {
    return ({
      openPorts: false,
      UPnP: true,
      msg: 'Cloud service',
    });
  }

  else {
    return ({
      openPorts: true,
      UPnP: false,
      msg: 'UPnP not available. Turn it on or open ports manually',
    });
  }
};

const runUpnpScript = () => {
  return new Promise((resolve, reject) => {
    const cmd = './check_upnp.sh';
    exec(cmd, (error) => {
      if (error) return reject(error);
      return resolve();
    });
  });
};

module.exports = createStatusUPnP;
