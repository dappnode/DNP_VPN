const res = require('../utils/res')
const credentialsFile = require('../utils/credentialsFile')


const MASTER_ADMIN_IP = '172.33.10.1'
const USER_STATIC_IP_PREFIX = '172.33.100.'
const ADMIN_STATIC_IP_PREFIX = '172.33.10.'


function createToggleAdmin(credentialsFile) {

  return async function toggleAdmin (args) {

    let deviceName = args[0]

    // Fetch devices data from the chap_secrets file
    let credentialsArray = await credentialsFile.fetch()

    // Do not allow the user to remove all

    // Find the requested name in the device object array
    // if found: splice the device's object,
    // else: throw error
    let deviceNameFound = false
    let isAdmin
    for (i = 0; i < credentialsArray.length; i++) {
      if (deviceName == credentialsArray[i].name) {

        // Prevent the user from deleting admins
        if (credentialsArray[i].ip.includes(MASTER_ADMIN_IP)) {
          throw Error('You cannot remove the master admin user')

        } else if (credentialsArray[i].ip.includes(ADMIN_STATIC_IP_PREFIX)) {
          isAdmin = true
          credentialsArray[i].ip = credentialsArray[i].ip.replace(ADMIN_STATIC_IP_PREFIX, USER_STATIC_IP_PREFIX)

        } else if (credentialsArray[i].ip.includes(USER_STATIC_IP_PREFIX)) {
          credentialsArray[i].ip = credentialsArray[i].ip.replace(USER_STATIC_IP_PREFIX, ADMIN_STATIC_IP_PREFIX)
        }
        // Raise found flag
        deviceNameFound = true
      }
    }

    // Write back the device object array
    // Log results to the UI
    if (!deviceNameFound) {
      throw Error('Device name not found: '+deviceName)
    }

    // Write back the device object array
    await credentialsFile.write(credentialsArray)

    let msg = isAdmin ? 'Removed admin credentials from '+deviceName : 'Given admin credentials to '+deviceName
    return res.success(msg)

  }
}


module.exports = createToggleAdmin
