const fs = require('fs');
const getCCD = require('../utils/getCCD');
const getUserList = require('../utils/getUserList');

const ccdPath = '/etc/openvpn/ccd'
const ccdNetmask = '255.255.0.0'
const masterAdmin = 'dappnode_admin'
const {eventBus, eventBusTag} = require('../eventBus');


async function toggleAdmin({id}) {

  let devices = await getUserList.fetch();
  if (!devices.includes(id)) {
    throw Error('Device not found: '+id);
  };

  const ccdArray = await getCCD.fetch();
  let isAdmin = ccdArray.find((c) => c.cn === id);

  if (id === masterAdmin) {
    throw Error('You cannot remove the master admin user');
  } else if (isAdmin) {
    try {
      await fs.unlinkSync(ccdPath + '/' + id);
    } catch (err) {
      throw Error('Failed to remove ccd from: ' + id);
    };
  } else {
    const ccdContent = `ifconfig-push ${getCCD.lowestIP(ccdArray)} ${ccdNetmask}`;
    fs.writeFileSync(ccdPath + '/' + id, ccdContent);
  };

  // Emit packages update
  eventBus.emit(eventBusTag.emitDevices);

  return {
    message: isAdmin ? 'Removed admin credentials from '+id : 'Given admin credentials to '+id,
    logMessage: true,
    userAction: true,
  };
}

module.exports = toggleAdmin;
