const res = require('../utils/res')


const ADMIN_STATIC_IP_PREFIX = '172.33.10.'


function createRemoveDevice(credentialsFile) {

  return async function removeDevice (args) {

    let deviceName = args[0]

    // Fetch devices data from the chap_secrets file
    let credentialsArray = await credentialsFile.fetch()

    // Find the requested name in the device object array
    // if found: splice the device's object,
    // else: throw error
    let deviceNameFound = false
    for (i = 0; i < credentialsArray.length; i++) {
      if (deviceName == credentialsArray[i].name) {

        // Prevent the user from deleting admins
        if (credentialsArray[i].ip.includes(ADMIN_STATIC_IP_PREFIX)) {
          throw Error('You cannot remove an admin user')

        } else {
          deviceNameFound = true
          credentialsArray.splice(i, 1)
        }
      }
    }

    if (!deviceNameFound) {
      throw Error('Device name not found: '+deviceName)
    }

    // Write back the device object array
    await credentialsFile.write(credentialsArray)

    return res.success('Removed device '+deviceName)

  }
}


module.exports = createRemoveDevice
