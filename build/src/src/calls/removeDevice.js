const credentialsFile = require('../utils/credentialsFile');
const {eventBus, eventBusTag} = require('../eventBus');

const adminStaticIpPrefix = '172.33.10.';

async function removeDevice({id}) {
  // Fetch devices data from the chap_secrets file
  let credentialsArray = await credentialsFile.fetch();

  // Find the requested name in the device object array
  // if found: splice the device's object,
  // else: throw error
  let deviceNameFound = false;
  for (let i = 0; i < credentialsArray.length; i++) {
    if (id == credentialsArray[i].name) {
      // Prevent the user from deleting admins
      if (credentialsArray[i].ip.includes(adminStaticIpPrefix)) {
        throw Error('You cannot remove an admin user');
      } else {
        deviceNameFound = true;
        credentialsArray.splice(i, 1);
        break;
      }
    }
  }

  if (!deviceNameFound) {
    throw Error('Device name not found: '+id);
  }

  // Write back the device object array
  await credentialsFile.write(credentialsArray);

  // Emit packages update
  eventBus.emit(eventBusTag.emitDevices);

  return {
    message: 'Removed device '+id,
    logMessage: true,
    userAction: true,
  };
}


module.exports = removeDevice;
