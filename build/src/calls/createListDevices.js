const res = require('../utils/res')


function createListDevices(credentialsFile, generate, params) {

  return async function listDevices () {

    // Fetch devices data from the chap_secrets file
    let deviceList = await credentialsFile.fetch()
    deviceList.forEach(function(credentials) {
      credentials.otp = generate.otp(credentials.name, credentials.password, params.VPN)
    })

    return res.success('Listing '+deviceList.length+' devices', deviceList)

  }
}


module.exports = createListDevices
