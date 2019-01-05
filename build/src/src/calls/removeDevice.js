const fs = require('fs');

const getUserList = require('../utils/getUserList');
const getCCD = require('../utils/getCCD');
const shell = require('../utils/shell');

const {eventBus, eventBusTag} = require('../eventBus');

const revokeCommand = '/usr/local/bin/ovpn_revokeclient';

async function removeDevice({id}) {
  let deviceArray = await getUserList();
  let ccdArray = await getCCD();

  if (ccdArray.find((c) => c.cn === id)) throw Error('You cannot remove an admin user');

  if (!deviceArray.includes(id)) throw Error('Device name not found: '+id);

  try {
    await shell(`${revokeCommand} ${id}`);
    await fs.unlinkSync(`${process.env.OPENVPN}/pki/private/${id}.key`);
    await fs.unlinkSync(`${process.env.OPENVPN}/pki/reqs/${id}.req`);
    await fs.unlinkSync(`${process.env.OPENVPN}/pki/issued/${id}.crt`);
  } catch (err) {
    throw Error(`Error removing device ${id}: ${err}`);
  }

  eventBus.emit(eventBusTag.emitDevices);

  return {
    message: 'Removed device '+id,
    logMessage: true,
    userAction: true,
  };
}


module.exports = removeDevice;
