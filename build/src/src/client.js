const autobahn = require('autobahn');
const logs = require('./logs.js')(module);
const db = require('./db');

const dyndnsClient = require('./dyndnsClient');
const calls = require('./calls');
const fetchVpnParameters = require('./fetchVpnParameters');
const loginMsg = require('./loginMsg');
const {eventBus, eventBusTag} = require('./eventBus');

const URL = 'ws://my.wamp.dnp.dappnode.eth:8080/ws';
const REALM = 'dappnode_admin';
const publicIpCheckInterval = 30 * 60 * 1000;


// /////////////////////////////
// Setup crossbar connection //
// /////////////////////////////


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
        session.publish(eventDevices, [], {devices: res.deviceList});
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

  // init.sh
  // 1. Create VPN's address + publicKey + privateKey if it doesn't exist yet
  await dyndnsClient.generateKeys();

  // fetchVpnParameters read the output files from the .sh scripts
  // and stores the values in the db
  logs.info('Loading VPN parameters... It may take a while');
  await fetchVpnParameters();

  // If the user has not defined a static IP use dynamic DNS
  // > staticIp is set in `await fetchVpnParameters();`
  if (!await db.get('staticIp')) {
    logs.info('Registering to the dynamic DNS...');
    await dyndnsClient.updateIp();
  }

  // Watch for IP changes, if so update the IP. On error, asume the IP changed.
  let _ip = '';
  setInterval(async () => {
    try {
      if (!await db.get('staticIp')) {
        const ip = await dyndnsClient.getPublicIp();
        if (!ip || ip !== _ip) {
          dyndnsClient.updateIp();
          _ip = ip;
        }
        if (ip) await db.set('ip', ip);
      }
    } catch (e) {
      logs.error(`Error on dyndns interval: ${e.stack || e.message}`);
    }
  }, publicIpCheckInterval);

  // Print db censoring privateKey
  const _db = await db.get();
  if (_db && _db.privateKey) {
    _db.privateKey = _db.privateKey.replace(/./g, '*');
  }
  logs.info(JSON.stringify(_db, null, 2 ));

  // ///////////////////////
  // Finished initialization
  // ///////////////////////
  // ///////////////////////
  //
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
    function(reg) {logs.info('CROSSBAR: registered '+event);},
    function(err) {logs.error('CROSSBAR: error registering '+event+'. Error message: '+err.error);}
  );
}

function error2obj(e) {
  return {name: e.name, message: e.message, stack: e.stack, userAction: true};
}


