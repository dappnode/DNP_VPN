const fs = require('file-system');
const exec = require('child_process').exec;
const {promisify} = require('util');
const readFileAsync = promisify(fs.readFile);
const execAsync = promisify(exec);

const logs = require('../logs.js')(module);

const DEV = process.env.DEV;

const getUpnpStatus = DEV ? () => {} : require('./getUpnpStatus');
const getExternalIpStatus = DEV ? () => {} : require('./getExternalIpStatus');

// Fetch VPN parameters loads all files containing parameters and status
// It acts as a cache to minimize response time.
// The computation of this parameters is triggered from somewhere else.


const VPN_IP_FILE_PATH = DEV ? './test/ip' : process.env.VPN_IP_FILE_PATH;
const VPN_PSK_FILE_PATH = DEV ? './test/psk' : process.env.VPN_PSK_FILE_PATH;
const VPN_NAME_FILE_PATH = DEV ? './test/name' : process.env.VPN_NAME_FILE_PATH;
const INT_IP_FILE_PATH = DEV ? './test/internal-ip' : process.env.INTERNAL_IP_FILE_PATH;
const EXT_IP_FILE_PATH = DEV ? './test/external-ip' : process.env.EXTERNAL_IP_FILE_PATH;
const EXTERNALIP_STATUS_FILE_PATH =
  DEV ? './test/external-ip_status' : process.env.EXTERNALIP_STATUS_FILE_PATH;
const UPNP_STATUS_FILE_PATH =
  DEV ? './test/upnp_status' : process.env.UPNP_STATUS_FILE_PATH;

const MAXATTEMPTS = 3 * 60; // 3 min
const PAUSETIME = 1000;

async function fetchVPNparameters() {
  // The second parameter is a fallback value
  // Not providing if enforces the existance of the file

  // > This files contain raw variables
  const IP = await fetchVpnParameter(VPN_IP_FILE_PATH);
  const PSK = await fetchVpnParameter(VPN_PSK_FILE_PATH);
  const INT_IP = await fetchVpnParameter(INT_IP_FILE_PATH, '');
  const EXT_IP = await fetchVpnParameter(EXT_IP_FILE_PATH, '');
  const NAME = await fetchVpnParameter(VPN_NAME_FILE_PATH, 'DAppNode_server');

  // Trigger a parameter computation but don't wait for it
  // On the first run only, the awaits below will halt the execution
  runUpnpScript();
  getUpnpStatus(IP, EXT_IP, INT_IP);
  getExternalIpStatus(IP, EXT_IP, INT_IP);

  // > This files contain stringified jsons
  const EXTERNALIP_STATUS = JSON.parse( await fetchVpnParameter(EXTERNALIP_STATUS_FILE_PATH) );
  const UPNP_STATUS = JSON.parse( await fetchVpnParameter(UPNP_STATUS_FILE_PATH) );

  return {
    IP,
    PSK,
    INT_IP,
    EXT_IP,
    NAME,
    EXTERNALIP_STATUS,
    UPNP_STATUS,
  };
}

async function fileToExist(FILE_PATH, fallbackValue) {
    for (let i = 0; i < MAXATTEMPTS; i++) {
      if (fs.existsSync(FILE_PATH)) return;
      await pause(PAUSETIME);
    }
    if (fallbackValue) {
      logs.warn('Option file '+FILE_PATH+' not found (after #' + MAXATTEMPTS + ' attempts) '
        +'- Fallback value: '+fallbackValue);
      return fallbackValue;
    }
    throw Error('Mandatory file '+FILE_PATH+' not found (after #' + MAXATTEMPTS + ' attempts)');
}


const fetchVpnParameter = (FILE_PATH, fallbackValue = false) =>
  fileToExist(FILE_PATH, fallbackValue)
  .then(() => readFileAsync(FILE_PATH, 'utf-8'))
  .then((data) => String(data).trim());


const runUpnpScript = async () => {
  // Run script
  await execAsync('./check_upnp.sh');
};

// /////////////////
// Helper functions

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = fetchVPNparameters;
