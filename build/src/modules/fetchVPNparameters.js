const fs = require('file-system')
const util = require('util')
const readFile = util.promisify(fs.readFile)

const VPN_IP_FILE_PATH = process.env.DEV ? './test/ip' : process.env.VPN_IP_FILE_PATH
const VPN_PSK_FILE_PATH = process.env.DEV ? './test/psk' : process.env.VPN_PSK_FILE_PATH
const VPN_NAME_FILE_PATH = process.env.DEV ? './test/name' : process.env.VPN_NAME_FILE_PATH
const INT_IP_FILE_PATH = process.env.DEV ? './test/internal-ip' : process.env.INTERNAL_IP_FILE_PATH
const EXT_IP_FILE_PATH = process.env.DEV ? './test/external-ip' : process.env.EXTERNAL_IP_FILE_PATH

let maxAttempts = 10;

async function fetchVPNparameters() {

  // The second parameter is a fallback value
  // Not providing if enforces the existance of the file
  const IP = await fetchVPN_PARAMETER(VPN_IP_FILE_PATH)
  const PSK = await fetchVPN_PARAMETER(VPN_PSK_FILE_PATH)
  const INT_IP = await fetchVPN_PARAMETER(INT_IP_FILE_PATH, "")
  const EXT_IP = await fetchVPN_PARAMETER(EXT_IP_FILE_PATH, "")
  const NAME = await fetchVPN_PARAMETER(VPN_NAME_FILE_PATH, 'DAppNode_server')

  return { IP, PSK, INT_IP, EXT_IP, NAME }
}


async function fileToExist(FILE_PATH, fallbackValue) {
    for (let i = 0; i < maxAttempts; i++) {
      if (fs.existsSync(FILE_PATH)) return
      await pauseSync(500)
    }
    if (fallbackValue) {
      console.log('File '+FILE_PATH+' not found (#' + maxAttempts + ' tries) - WARN: Using fallback value: '+fallbackValue)
      return fallbackValue
    }
    throw 'File '+FILE_PATH+' not found (#' + maxAttempts + ' tries) - ERROR: file is mandatory'
}


const fetchVPN_PARAMETER = (FILE_PATH, fallbackValue = false) => 
  fileToExist(FILE_PATH, fallbackValue)
  .then(() => readFile(FILE_PATH, 'utf-8'))
  .then(data => String(data).trim())


///////////////////
// Helper functions

const pauseSync = ms => new Promise(resolve => setTimeout(resolve, ms))

module.exports = fetchVPNparameters
