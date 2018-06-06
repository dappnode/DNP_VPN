// import dependencies
const createLogAdminCredentials = require('./modules/createLogAdminCredentials')
const credentialsFile = require('./utils/credentialsFile')
const generate = require('./utils/generate')
const fetchVPNparameters = require('./modules/fetchVPNparameters')

// Initialize dependencies
const logAdminCredentials = createLogAdminCredentials(credentialsFile, generate)


start()

async function start () {

  //console.log('Waiting for credentials files to exist')
  const VPN = await fetchVPNparameters()
  //console.log('VPN credentials fetched, VPN_IP: ' + VPN_IP + ' VPN_PSK: ' + VPN_PSK)

  logAdminCredentials(VPN)

}
