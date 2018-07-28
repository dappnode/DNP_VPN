const fs = require('file-system');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const logs = require('../logs.js')(module);

const VPN_IP_FILE_PATH = process.env.DEV ? './test/ip' : process.env.VPN_IP_FILE_PATH;
const VPN_PSK_FILE_PATH = process.env.DEV ? './test/psk' : process.env.VPN_PSK_FILE_PATH;
const VPN_NAME_FILE_PATH = process.env.DEV ? './test/name' : process.env.VPN_NAME_FILE_PATH;
const INT_IP_FILE_PATH = process.env.DEV ? './test/internal-ip' : process.env.INTERNAL_IP_FILE_PATH;
const EXT_IP_FILE_PATH = process.env.DEV ? './test/external-ip' : process.env.EXTERNAL_IP_FILE_PATH;

const MAXATTEMPTS = 90; // 3 min
const PAUSETIME = 2000; 

async function fetchVPNparameters() {
  // The second parameter is a fallback value
  // Not providing if enforces the existance of the file
  const IP = await fetchVpnParameter(VPN_IP_FILE_PATH);
  const PSK = await fetchVpnParameter(VPN_PSK_FILE_PATH);
  const INT_IP = await fetchVpnParameter(INT_IP_FILE_PATH, '');
  const EXT_IP = await fetchVpnParameter(EXT_IP_FILE_PATH, '');
  const NAME = await fetchVpnParameter(VPN_NAME_FILE_PATH, 'DAppNode_server');

  return {IP, PSK, INT_IP, EXT_IP, NAME};
}


async function fileToExist(FILE_PATH, fallbackValue) {
    for (let i = 0; i < MAXATTEMPTS; i++) {
      if (fs.existsSync(FILE_PATH)) return;
      await pauseSync(PAUSETIME);
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
  .then(() => readFile(FILE_PATH, 'utf-8'))
  .then((data) => String(data).trim());


// /////////////////
// Helper functions

const pauseSync = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = fetchVPNparameters;
