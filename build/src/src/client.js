const autobahn = require('autobahn');
const logs = require('./logs.js')(module);

// New gen
const dyndnsClient = require('./dyndnsClient');

// import calls
const createAddDevice = require('./calls/createAddDevice');
const createRemoveDevice = require('./calls/createRemoveDevice');
const createToggleAdmin = require('./calls/createToggleAdmin');
const createListDevices = require('./calls/createListDevices');
const createGetParams = require('./calls/createGetParams');
const createStatusUPnP = require('./calls/createStatusUPnP');
const createStatusExternalIp = require('./calls/createStatusExternalIp');

// import dependencies
const credentialsFile = require('./utils/credentialsFile');
const generate = require('./utils/generate');
const createLogAdminCredentials = require('./modules/createLogAdminCredentials');
const fetchVpnParameters = require('./modules/fetchVpnParameters');

// Initialize dependencies
let params = {};
const statusUPnP = createStatusUPnP(params, fetchVpnParameters);
const statusExternalIp = createStatusExternalIp(params, fetchVpnParameters);
const logAdminCredentials = createLogAdminCredentials(
  credentialsFile,
  generate
);

// Initialize calls
const addDevice = createAddDevice(credentialsFile, generate);
const removeDevice = createRemoveDevice(credentialsFile);
const toggleAdmin = createToggleAdmin(credentialsFile);
const listDevices = createListDevices(credentialsFile, generate, params);
const getParams = createGetParams(params);


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
  register(session, 'getParams.vpn.dappnode.eth', getParams);
  register(session, 'addDevice.vpn.dnp.dappnode.eth', addDevice);
  register(session, 'removeDevice.vpn.dnp.dappnode.eth', removeDevice);
  register(session, 'toggleAdmin.vpn.dnp.dappnode.eth', toggleAdmin);
  register(session, 'listDevices.vpn.dnp.dappnode.eth', listDevices);
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

  logs.info('Loading VPN parameters... It may take a while');
  params = {
    ...params,
    ...(await fetchVpnParameters()),
  };

  logs.info('Registering to the dynamic DNS...');
  params.server = await dyndnsClient.updateIp() || params.IP;

  logs.info('VPN credentials fetched - \n  '
    + Object.keys(params)
      .filter((name) => typeof params[name] !== 'object')
      .map((name) => name+': '+params[name]).join('\n  '));

  logAdminCredentials(params);

  // Watch for IP changes, if so update the IP. On error, asume the IP changed.
  let _IP = '';
  setInterval(() => {
    dyndnsClient.getPublicIp().then((IP) => {
      if (!IP || IP !== _IP) {
        dyndnsClient.updateIp();
        _IP = IP;
      }
      if (IP) params.IP = IP;
    });
  }, 30*60*1000);
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
          message: res.message,
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


