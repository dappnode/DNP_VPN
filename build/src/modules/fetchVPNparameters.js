const fs = require('file-system')


const VPN_IP_FILE_PATH = process.env.DEV ? './test/ip' : process.env.VPN_IP_FILE_PATH
const VPN_PSK_FILE_PATH = process.env.DEV ? './test/psk' : process.env.VPN_PSK_FILE_PATH
const VPN_NAME_FILE_PATH = process.env.DEV ? './test/name' : process.env.VPN_NAME_FILE_PATH


async function fetchVPNparameters() {

  await fileToExist(VPN_IP_FILE_PATH)
  await fileToExist(VPN_PSK_FILE_PATH)

  const IP = await fetchVPN_PARAMETER(VPN_IP_FILE_PATH)
  const PSK = await fetchVPN_PARAMETER(VPN_PSK_FILE_PATH)

  // The existence of this file is not crucial to the system
  // It it doesn't exist fallback to a default name
  let NAME
  if (fs.existsSync(VPN_NAME_FILE_PATH)) {
    NAME = await fetchVPN_PARAMETER(VPN_NAME_FILE_PATH)
  } else {
    NAME = 'DAppNode_server'
  }

  return { IP, PSK, NAME }

}


function fileToExist(FILE_PATH) {

  let maxAttempts = 120;

  return new Promise(async function(resolve, reject) {
    for (let i = 0; i < maxAttempts; i++) {
      if (fs.existsSync(FILE_PATH)) {
        return resolve()
      }
      await pauseSync(500)
    }
    throw 'File not existent after #' + maxAttempts + ' attempts, path: ' + FILE_PATH
  })

}


function fetchVPN_PARAMETER(VPN_PARAMETER_FILE_PATH) {

  return new Promise(function(resolve, reject) {

    fs.readFile(VPN_PARAMETER_FILE_PATH, 'utf-8', (err, fileContent) => {
      if (err) throw err
      let VPN_PARAMETER = String(fileContent).trim()
      resolve(VPN_PARAMETER)
    })

  })
}


///////////////////
// Helper functions


function pauseSync(ms) {
  return new Promise(function(resolve, reject) {
    setTimeout(function(){
      resolve()
    }, ms);
  })
}


module.exports = fetchVPNparameters
