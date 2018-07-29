const exec = require('child_process').exec;
const {promisify} = require('util');
const fs = require('fs');

const UPNP_STATUS_FILE_PATH =
  process.env.DEV ? './test/upnp_status' : process.env.UPNP_STATUS_FILE_PATH;

async function getUpnpStatus(IP, EXT_IP, INT_IP) {
  // Check availability of UPnP
  await runUpnpScript();
  const upnpStatus = getStatus(IP, EXT_IP, INT_IP);
  // Write to file
  fs.writeFileSync(
    UPNP_STATUS_FILE_PATH,
    JSON.stringify(upnpStatus),
    'utf8'
);
}

const getStatus = (IP, EXT_IP, INT_IP) => {
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

const runUpnpScript = async () => {
  // Promisify
  const writeFileAsync = promisify(fs.writeFile); // (A)
  const execAsync = promisify(exec); // (A)
  // Run script
  /* eslint-disable max-len */ /* eslint-disable no-useless-escape */
  const VPN_CONTAINER = 'DAppNodeCore-vpn.dnp.dappnode.eth';
  const IMAGE = await execAsync('docker inspect '+VPN_CONTAINER+' -f \'{{.Config.Image}}\'');
  const EXTERNAL_IP = await execAsync('docker run --rm --net=host '+IMAGE+' upnpc -l | awk -F\'= \'  \'/ExternalIPAddress/{print $2}\'');
  const INTERNAL_IP = await execAsync('docker run --rm --net=host '+IMAGE+' ip route get 1  | sed -n \'s/.*src \([0-9.]\+\).*/\1/p\'');
  await writeFileAsync(process.env.EXTERNAL_IP_FILE_PATH, EXTERNAL_IP, 'utf8');
  await writeFileAsync(process.env.INTERNAL_IP_FILE_PATH, INTERNAL_IP, 'utf8');
  /* eslint-enable max-len */ /* eslint-enable no-useless-escape */
};

module.exports = getUpnpStatus;
