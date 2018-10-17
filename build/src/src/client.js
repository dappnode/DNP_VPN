const autobahn = require('autobahn');
const logs = require('./logs.js')(module);
const db = require('./db');

const dyndnsClient = require('./dyndnsClient');
const calls = require('./calls');
const logAdminCredentials = require('./logAdminCredentials');
const fetchVpnParameters = require('./fetchVpnParameters');
const getInstallationStaticIp = require('./utils/getInstallationStaticIp');

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

  // fetchVpnParameters read the output files from the .sh scripts
  // and stores the values in the db
  logs.info('Loading VPN parameters... It may take a while');
  await fetchVpnParameters();

  // Load the static IP defined in the installation
  if (!db.get('staticIp').value()) {
    const installationStaticIp = await getInstallationStaticIp();
    if (installationStaticIp) {
      logs.info(`Static IP was set during installation: ${installationStaticIp}`);
      db.set('staticIp', installationStaticIp).value();
    }
  }

  // If the user has not defined a static IP use dynamic DNS
  if (!db.get('staticIp').value()) {
    logs.info('Registering to the dynamic DNS...');
    await dyndnsClient.updateIp();
  }

  // Watch for IP changes, if so update the IP. On error, asume the IP changed.
  let _ip = '';
  setInterval(() => {
    if (!db.get('staticIp').value()) {
      dyndnsClient.getPublicIp().then((ip) => {
        if (!ip || ip !== _ip) {
          dyndnsClient.updateIp();
          _ip = ip;
        }
        if (ip) db.set('ip', ip).write();
      });
    }
  }, publicIpCheckInterval);

  logs.info('VPN credentials fetched');
  logAdminCredentials();
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


