const autobahn = require('autobahn');
const logs = require('./logs.js')(module);
const db = require('./db');
const calls = require('./calls');
const {eventBus, eventBusTag} = require('./eventBus');
// Modules
const dyndnsClient = require('./dyndnsClient');
const upnpc = require('./upnpc');
// Scripts
const openPorts = require('./openPorts');
const loginMsg = require('./loginMsg');
// Utils
const getInternalIp = require('./utils/getInternalIp');
const getServerName = require('./utils/getServerName');
const getPublicIp = require('./utils/getPublicIp');
const ping = require('./utils/ping');


const URL = 'ws://my.wamp.dnp.dappnode.eth:8080/ws';
const REALM = 'dappnode_admin';
const publicIpCheckInterval = 30 * 60 * 1000;


// ////////////////////////////
// Setup crossbar connection //
// ////////////////////////////


const connection = new autobahn.Connection({url: URL, realm: REALM});

connection.onopen = function(session, details) {
  logs.info('CONNECTED to DAppnode\'s WAMP '+
      '\n   url '+URL+
      '\n   realm: '+REALM+
      '\n   session ID: '+details.authid);

  register(session, 'ping.vpn.dnp.dappnode.eth', (x) => x);
  for (const callId of Object.keys(calls)) {
    register(session, callId+'.vpn.dnp.dappnode.eth', calls[callId]);
  }

  /**
   * Emits the directory
   */
  const eventDevices = 'devices.vpn.dnp.dappnode.eth';
  eventBus.on(eventBusTag.emitDevices, () => {
    try {
      calls.listDevices().then((res) => {
        // res.result = devices = {Array}
        session.publish(eventDevices, res.result);
      });
    } catch (e) {
      logs.error('Error publishing directory: '+e.stack);
    }
  });
};

connection.onclose = function(reason, details) {
  logs.error('Connection closed, reason: '+reason+' details '+JSON.stringify(details));
};


// //////////////////////////////
//  Open crossbar connection  //
// //////////////////////////////


start();

async function start() {
  logs.info('Attempting to connect to.... \n'
    +'   url: '+connection._options.url+'\n'
    +'   realm: '+connection._options.realm);
  connection.open();

  // 1. Directly connected to the internet: Public IP is the interface IP
  // 2. Behind a router: Needs to get the public IP, open ports and get the internal IP
  // 2A. UPnP available: Get public IP without a centralize service. Can open ports
  // 2B. No UPnP: Open ports manually, needs a centralized service to get the public IP
  // 2C. No NAT-Loopback: Public IP can't be resolved within the same network. User needs 2 profiles

  // Check if the static IP is set. If so, don't use any centralized IP-related service
  // The publicIp will be obtained in the entrypoint.sh and exported as PUBLIC_IP
  const publicIp = process.env.PUBLIC_IP || await getPublicIp();
  const intenalIp = await getInternalIp();
  const behindRouter = intenalIp !== publicIp;
  const upnpAvailable = behindRouter && await upnpc.isAvailable();
  const noNatLoopback = behindRouter && !(await ping(publicIp));
  const alertUserToOpenPorts = behindRouter && !upnpAvailable;

  await db.set('ip', publicIp);
  await db.set('psk', process.env.PSK);
  await db.set('name', await getServerName());
  await db.set('upnpAvailable', upnpAvailable);
  await db.set('noNatLoopback', noNatLoopback);
  await db.set('alertToOpenPorts', alertUserToOpenPorts);

  if (upnpAvailable) {
    // Run the openPorts script without await completition
    openPorts()
    .then(() => logs.info('Open ports script - Successfully completed'))
    .catch((e) => logs.error(`Open ports script - Error: ${e.stack}`));
  } else {
    logs.info('Open ports script - skipping, UPnP is not available');
  }

  // Create VPN's address + publicKey + privateKey if it doesn't exist yet (with static ip or not)
  // + Verify if the privateKey is corrupted or lost. Then create a new identity and alert the user
  await dyndnsClient.generateKeys();

  // Watch for IP changes, if so update the IP. On error, asume the IP changed.
  // If the user has not defined a static IP use dynamic DNS
  // > staticIp is set in `getPublicIp()`
  let _ip = '';
  setIntervalAndRun(async () => {
    try {
      // If the static IP is defined, skip registering to dyndns
      if (await db.get('staticIp')) return;
      // Otherwise, obtain the public IP and register
      const ip = await getPublicIp();
      if (!ip || ip !== _ip) {
        dyndnsClient.updateIp();
        _ip = ip;
      }
      if (ip) await db.set('ip', ip);
    } catch (e) {
      logs.error(`Error on dyndns interval: ${e.stack || e.message}`);
    }
  }, publicIpCheckInterval);

  // Print db for debugging
  const _db = await db.get();
  logs.info(JSON.stringify(_db, null, 2 ));

  // ///////////////////////
  // Finished initialization
  // ///////////////////////

  // The following code generates a text file with the message to be printed out
  // for the user to connect to DAppNode. It contains the information to print and
  // also serves as flag to signal the end of the initialization
  logs.info(await loginMsg.write());
}


// /////////////////////////////
// Connection helper functions


function register(session, event, handler) {
  const wrapErrors = (handler) =>
    async function(args, kwargs) {
      // 0. args: an array with call arguments
      // 1. kwargs: an object with call arguments
      // 2. details: an object which provides call metadata

      // Construct logger. The dappmanager stores the logs
      // and forwards them to the ADMIN UI
      const logToDappmanager = (log) => {
        session.publish('logUserActionToDappmanager', [log]);
      };

      try {
        const res = await handler(kwargs);

        // Log result
        logToDappmanager({level: 'info', event, ...res, kwargs});
        const eventShort = event.replace('.vpn.dnp.dappnode.eth', '');
        if (res.logMessage) {
          logs.info('Result of '+eventShort+': '+res.message);
        }
        return JSON.stringify({
          success: true,
          message: res.message || event,
          result: res.result || {},
        });
      } catch (err) {
        logToDappmanager({level: 'error', event, ...error2obj(err), kwargs});
        logs.error('Event: '+event+', Error: '+err);
        return JSON.stringify({
          success: false,
          message: err.message,
        });
      }
    };

  return session.register(event, wrapErrors(handler)).then(
    (reg) => {logs.info('CROSSBAR: registered '+event);},
    (err) => {logs.error('CROSSBAR: error registering '+event+'. Error message: '+err.error);}
  );
}

const error2obj = (e) => ({name: e.name, message: e.message, stack: e.stack, userAction: true});

// //////////////////////////////
//  Open ports (UPnP script)   //
// //////////////////////////////

function setIntervalAndRun(fn, t) {
  fn();
  return (setInterval(fn, t));
}


