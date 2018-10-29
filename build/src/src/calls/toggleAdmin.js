const credentialsFile = require('../utils/credentialsFile');
const {eventBus, eventBusTag} = require('../eventBus');

const masterAdminIp = '172.33.10.1';
const userStaticIpPrefix = '172.33.100.';
const adminStaticIpPrefix = '172.33.10.';

async function toggleAdmin({id}) {
  // Fetch devices data from the chap_secrets file
  let credentialsArray = await credentialsFile.fetch();

  // Do not allow the user to remove all

  // Find the requested name in the device object array
  // if found: splice the device's object,
  // else: throw error
  let isAdmin;
  const device = credentialsArray.find((d) => d.name === id);
  if (!device) {
    throw Error('Device name not found: '+id);
  }

  // Prevent the user from deleting admins
  let ip = device.ip;
  if (ip && ip.trim() === masterAdminIp) {
    throw Error('You cannot remove the master admin user');
  } else if (ip.includes(adminStaticIpPrefix)) {
    isAdmin = true;
    ip = ip.replace(adminStaticIpPrefix, userStaticIpPrefix);
  } else if (ip.includes(userStaticIpPrefix)) {
    ip = ip.replace(userStaticIpPrefix, adminStaticIpPrefix);
  }

  // Write back the device object array
  // The modification happens in place, to respect the order of users in the file
  for (const d of credentialsArray) {
    if (d.name === id) {
      d.ip = ip;
      break;
    }
  }
  await credentialsFile.write(credentialsArray);

  // Emit packages update
  eventBus.emit(eventBusTag.emitDevices);

  return {
    message: isAdmin ? 'Removed admin credentials from '+id : 'Given admin credentials to '+id,
    logMessage: true,
    userAction: true,
  };
}


module.exports = toggleAdmin;
