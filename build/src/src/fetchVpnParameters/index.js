const fs = require('file-system');
const {promisify} = require('util');
const readFileAsync = promisify(fs.readFile);
const db = require('../db');
const logs = require('../logs.js')(module);
const pause = require('../utils/pause');

const getUpnpStatus = require('./getUpnpStatus');
const getExternalIpResolves = require('./getExternalIpResolves');
const getInstallationStaticIp = require('./getInstallationStaticIp');


// Fetch VPN parameters loads all files containing parameters and status
// It acts as a cache to minimize response time.
// The computation of this parameters is triggered from somewhere else.


const publicIpPath = process.env.PUBLIC_IP_PATH;
const pskPath = process.env.PSK_PATH;
const serverNamePath = process.env.SERVER_NAME_PATH;
const internalIpPath = process.env.INTERNAL_IP_PATH;
const externalIpPath = process.env.EXTERNAL_IP_PATH;
const publicIpResolvedPath = process.env.PUBLIC_IP_RESOLVED_PATH;

const maxAttempts = 3 * 60; // 3 min
const pauseTime = 1000;

async function fetchVpnParameters() {
  // The second parameter is a fallback value
  // Not providing if enforces the existance of the file

  // Step 1: Get variables coming from the init.sh process
  // =====================================================
  // > This files contain raw variables
  const ip = await fetchVpnParameter(publicIpPath);
  const psk = await fetchVpnParameter(pskPath);
  const internalIp = await fetchVpnParameter(internalIpPath, '');
  const externalIp = await fetchVpnParameter(externalIpPath, '');
  const publicIpResolved =
    await fetchVpnParameter(publicIpResolvedPath) == '1'
    ? true : false;
  const name = await fetchVpnParameter(serverNamePath, 'DAppNode_server');

  await db.set('ip', ip);
  await db.set('psk', psk);
  await db.set('internalIp', internalIp);
  await db.set('externalIp', externalIp);
  await db.set('publicIpResolved', publicIpResolved);
  await db.set('name', name);


  // Step 2: Process the loaded variables
  // =============================================
  // > This files contain stringified jsons
  const externalIpResolves = getExternalIpResolves(ip, internalIp, publicIpResolved);
  const {openPorts, upnpAvailable} = getUpnpStatus(ip, externalIp, internalIp);
  // Get the static ip possibly set during the installation

  await db.set('externalIpResolves', externalIpResolves);
  await db.set('openPorts', openPorts);
  await db.set('upnpAvailable', upnpAvailable);


  // Step 3: Get ip (maybe) set during the installation
  // ==================================================
  // > Only write the IP if it comes from the installation
  if (!await db.get('initialized')) {
    const staticIp = await getInstallationStaticIp();
    await db.set('initialized', true);
    if (staticIp) {
      logs.info(`Static IP was set during installation: ${staticIp}`);
      await db.set('staticIp', staticIp);
    } else {
      logs.info(`Static IP was NOT set during installation`);
    }
  }

  // Step 4: Get the keys to register to the dyndns
  // > The keys will be automatically stored in the db
  if (!await db.get('staticIp')) {
    await dbEntryToExist('privateKey');
  }
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

async function dbEntryToExist(key) {
  for (let i = 0; i < maxAttempts; i++) {
    const value = await db.get(key);
    if (value) return value;
    await pause(pauseTime);
  }
  throw Error(`Mandatory db entry "${key}" not found (after #${maxAttempts} attempts)`);
}

const fetchVpnParameter = (path, fallbackValue = false) =>
  fileToExist(path, fallbackValue)
  .then(() => readFileAsync(path, 'utf-8'))
  .then((data) => String(data).trim());

module.exports = fetchVpnParameters;
