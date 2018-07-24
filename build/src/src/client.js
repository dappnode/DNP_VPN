const autobahn = require('autobahn');
const logs = require('./logs.js')(module);

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
const fetchVPNparameters = require('./modules/fetchVPNparameters');

// Initialize dependencies
const params = {};
const logAdminCredentials = createLogAdminCredentials(credentialsFile, generate);

// Initialize calls
const addDevice = createAddDevice(credentialsFile, generate);
const removeDevice = createRemoveDevice(credentialsFile);
const toggleAdmin = createToggleAdmin(credentialsFile);
const listDevices = createListDevices(credentialsFile, generate, params);
const getParams = createGetParams(params);
const statusUPnP = createStatusUPnP(params, fetchVPNparameters);
const statusExternalIp = createStatusExternalIp(params, fetchVPNparameters);

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
  logs.info('Waiting for credentials files to exist');
  params.VPN = await fetchVPNparameters();

  logs.info('VPN credentials fetched - \n  '
    + Object.keys(params.VPN).map((name) => name+': '+params.VPN[name]).join('\n  '));

  logAdminCredentials(params.VPN);

  logs.info('Attempting to connect to.... \n'
    +'   url: '+connection._options.url+'\n'
    +'   realm: '+connection._options.realm);
  connection.open();
}


// /////////////////////////////
// Connection helper functions


function register(session, event, handler) {
  const wrapErrors = (handler) =>
    async function(args, kwargs) {
      // 0. args: an array with call arguments
      // 1. kwargs: an object with call arguments
      // 2. details: an object which provides call metadata
      try {
        const res = await handler(kwargs);
        const eventShort = event.replace('.vpn.dnp.dappnode.eth', '');
        logs.info('Result of '+eventShort+': '+res.message);
        return JSON.stringify({
          success: true,
          message: res.message,
          result: res.result,
        });
      } catch (err) {
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


