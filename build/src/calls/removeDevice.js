const getUserList = require('../utils/getUserList');
const getCCD = require('../utils/getCCD');
const {eventBus, eventBusTag} = require('../eventBus');

async function removeDevice({id}) {
  // Fetch devices data from the chap_secrets file
  let deviceArray = await getUserList.fetch();
  let ccdArray = await getCCD.fetch();
  // Find the requested name in the device object array
  // if found: splice the device's object,
  // else: throw error

  // check if id is present in admins (ccd)
  let deviceNameFound = false;
  for (let i = 0; i < ccdArray.length; i++) {
    if (id == ccdArray[i].cn) {
        throw Error('You cannot remove an admin user');
    } else {
      deviceNameFound = true;
      // credentialsArray.splice(i, 1);
      break;
    }
    
  }

  if (!deviceNameFound) {
    throw Error('Device name not found: '+id);
  }

  // Revoke and delete certs

  // Emit packages update
  eventBus.emit(eventBusTag.emitDevices);

  return {
    message: 'Removed device '+id,
    logMessage: true,
    userAction: true,
  };
}


module.exports = removeDevice;
