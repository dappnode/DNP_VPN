const fs = require('file-system');
const {promisify} = require('util');
const readFileAsync = promisify(fs.readFile);
const db = require('../db');
const logs = require('../logs.js')(module);

const DEV = process.env.DEV;

const getUpnpStatus = require('./getUpnpStatus');
const getExternalIpResolves = require('./getExternalIpResolves');


// Fetch VPN parameters loads all files containing parameters and status
// It acts as a cache to minimize response time.
// The computation of this parameters is triggered from somewhere else.


const publicIpPath = DEV ? './mockFiles/ip' : process.env.PUBLIC_IP_PATH;
const pskPath = DEV ? './mockFiles/psk' : process.env.PSK_PATH;
const serverNamePath = DEV ? './mockFiles/name' : process.env.SERVER_NAME_PATH;
const internalIpPath = DEV ? './mockFiles/internal-ip' : process.env.INTERNAL_IP_PATH;
const externalIpPath = DEV ? './mockFiles/external-ip' : process.env.EXTERNAL_IP_PATH;
const publicIpResolvedPath =
  DEV ? './mockFiles/public-ip-resolved' : process.env.PUBLIC_IP_RESOLVED_PATH;

const maxAttempts = 3 * 60; // 3 min
const pauseTime = 1000;

async function fetchVpnParameters() {
  // The second parameter is a fallback value
  // Not providing if enforces the existance of the file

  // > This files contain raw variables
  const ip = await fetchVpnParameter(publicIpPath);
  const psk = await fetchVpnParameter(pskPath);
  const internalIp = await fetchVpnParameter(internalIpPath, '');
  const externalIp = await fetchVpnParameter(externalIpPath, '');
  const publicIpResolved =
    await fetchVpnParameter(publicIpResolvedPath) == '1'
    ? true : false;
  const name = await fetchVpnParameter(serverNamePath, 'DAppNode_server');
  // > This files contain stringified jsons
  const externalIpResolves = getExternalIpResolves(ip, internalIp, publicIpResolved);
  const {openPorts, upnpAvailable} = getUpnpStatus(ip, externalIp, internalIp);

  db.set('ip', ip).write();
  db.set('psk', psk).write();
  db.set('internalIp', internalIp).write();
  db.set('externalIp', externalIp).write();
  db.set('publicIpResolved', publicIpResolved).write();
  db.set('name', name).write();
  db.set('externalIpResolves', externalIpResolves).write();
  db.set('openPorts', openPorts).write();
  db.set('upnpAvailable', upnpAvailable).write();

  return {
    ip,
    psk,
    internalIp,
    externalIp,
    publicIpResolved,
    name,
    externalIpResolves,
    openPorts,
    upnpAvailable,
  };
}

async function fileToExist(path, fallbackValue) {
  for (let i = 0; i < maxAttempts; i++) {
    if (fs.existsSync(path)) return;
    await pause(pauseTime);
  }
  if (fallbackValue) {
    logs.warn('Option file '+path+' not found (after #' + maxAttempts + ' attempts) '
      +'- Fallback value: '+fallbackValue);
    return fallbackValue;
  }
  throw Error('Mandatory file '+path+' not found (after #' + maxAttempts + ' attempts)');
}


const fetchVpnParameter = (path, fallbackValue = false) =>
  fileToExist(path, fallbackValue)
  .then(() => readFileAsync(path, 'utf-8'))
  .then((data) => String(data).trim());

// /////////////////
// Helper functions

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = fetchVpnParameters;
