const autobahn = require('autobahn');
const logs = require('./logs.js')(module);
const db = require('./db');

// New gen
const dyndnsClient = require('./dyndnsClient');

// import calls
const createAddDevice = require('./calls/createAddDevice');
const createRemoveDevice = require('./calls/createRemoveDevice');
const createToggleAdmin = require('./calls/createToggleAdmin');
const createListDevices = require('./calls/createListDevices');
const setStaticIp = require('./calls/setStaticIp');
const getParams = require('./calls/getParams');
const statusUPnP = require('./calls/statusUPnP');
const statusExternalIp = require('./calls/statusExternalIp');

// import dependencies
const credentialsFile = require('./utils/credentialsFile');
const generate = require('./utils/generate');
const createLogAdminCredentials = require('./createLogAdminCredentials');
const fetchVpnParameters = require('./fetchVpnParameters');

// Initialize dependencies
const logAdminCredentials = createLogAdminCredentials(
  credentialsFile,
  generate
);

// Initialize calls
const addDevice = createAddDevice(credentialsFile, generate);
const removeDevice = createRemoveDevice(credentialsFile);
const toggleAdmin = createToggleAdmin(credentialsFile);
const listDevices = createListDevices(credentialsFile, generate);


const URL = 'ws://my.wamp.dnp.dappnode.eth:8080/ws';
const REALM = 'dappnode_admin';


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
  register(session, 'addDevice.vpn.dnp.dappnode.eth', addDevice);
  register(session, 'removeDevice.vpn.dnp.dappnode.eth', removeDevice);
  register(session, 'toggleAdmin.vpn.dnp.dappnode.eth', toggleAdmin);
  register(session, 'listDevices.vpn.dnp.dappnode.eth', listDevices);
  register(session, 'setStaticIp.vpn.dnp.dappnode.eth', setStaticIp);
  register(session, 'getParams.vpn.dappnode.eth', getParams);
  register(session, 'statusUPnP.vpn.dnp.dappnode.eth', statusUPnP);
  register(session, 'statusExternalIp.vpn.dnp.dappnode.eth', statusExternalIp);
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
  }, 30*60*1000);

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


