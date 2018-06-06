const autobahn = require('autobahn')
const fs = require('file-system')

// import calls
const createAddDevice = require('./calls/createAddDevice')
const createRemoveDevice = require('./calls/createRemoveDevice')
const createToggleAdmin = require('./calls/createToggleAdmin')
const createListDevices = require('./calls/createListDevices')

// import dependencies
const credentialsFile = require('./utils/credentialsFile')
const generate = require('./utils/generate')
const createLogAdminCredentials = require('./modules/createLogAdminCredentials')
const fetchVPNparameters = require('./modules/fetchVPNparameters')

// Initialize dependencies
const params = {}
const logAdminCredentials = createLogAdminCredentials(credentialsFile, generate)

// Initialize calls
const addDevice = createAddDevice(credentialsFile, generate)
const removeDevice = createRemoveDevice(credentialsFile)
const toggleAdmin = createToggleAdmin(credentialsFile)
const listDevices = createListDevices(credentialsFile, generate, params)

const URL = 'ws://my.wamp.dnp.dappnode.eth:8080/ws'
const REALM = 'dappnode_admin'


///////////////////////////////
// Setup crossbar connection //
///////////////////////////////


const connection = new autobahn.Connection({ url: URL, realm: REALM })
const SUCCESS_MESSAGE = '---------------------- \n procedure registered'
const ERROR_MESSAGE = '------------------------------ \n failed to register procedure '

connection.onopen = function (session, details) {

  console.log("CONNECTED to DAppnode's WAMP "+
      "\n   url "+URL+
      "\n   realm: "+REALM+
      "\n   session ID: "+details.authid)

  register(session, 'ping.vpn.dnp.dappnode.eth', x => x)
  register(session, 'addDevice.vpn.dnp.dappnode.eth', addDevice)
  register(session, 'removeDevice.vpn.dnp.dappnode.eth', removeDevice)
  register(session, 'toggleAdmin.vpn.dnp.dappnode.eth', toggleAdmin)
  register(session, 'listDevices.vpn.dnp.dappnode.eth', listDevices)

}

connection.onclose = function (reason, details) {
  console.log('[client.js connection.onclose] reason: '+reason+' details '+JSON.stringify(details))
};


////////////////////////////////
//  Open crossbar connection  //
////////////////////////////////


start()

async function start () {

  console.log('Waiting for credentials files to exist')
  params.VPN = await fetchVPNparameters()
  console.log('VPN credentials fetched, VPN_IP: ' + params.VPN.IP + ' VPN_PSK: ' + params.VPN.PSK + ' VPN_NAME ' + params.VPN.NAME)

  logAdminCredentials(params.VPN)

  console.log('Attempting to connect to.... \n'
    +'   url: '+connection._options.url+'\n'
    +'   realm: '+connection._options.realm)
  connection.open()

}


///////////////////////////////
// Connection helper functions


function register(session, event, handler) {

  const SUCCESS_MESSAGE = '---------------------- \n procedure registered'
  const ERROR_MESSAGE = '------------------------------ \n failed to register procedure '

  return session.register(event, wrapErrors(handler)).then(
    function (reg) { console.log(SUCCESS_MESSAGE) },
    function (err) { console.log(ERROR_MESSAGE, err) }
  )
}


function wrapErrors(handler) {

  return async function () {
    try {
        return await handler(arguments[0])
    } catch (err) {

      console.log(err)
      return JSON.stringify({
          success: false,
          message: err.message
      })

    }
  }
}
