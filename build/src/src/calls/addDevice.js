const {eventBus, eventBusTag} = require('../eventBus');
const shell = require('../utils/shell');
const getUserList = require('../utils/getUserList');

async function addDevice({id}) {
  if (id === '') {
    throw Error('The new device name cannot be empty');
  }
  if ((id || '').toLowerCase() === 'guests' || (id || '').toLowerCase() === 'guest') {
    throw Error(`Please use the enable guests function to create a "Guest(s)" user`);
  }

  let userArray = await getUserList();

  if ( ! userArray.includes((id)) ) {
    await shell(`easyrsa build-client-full ${id} nopass`);
  } else {
    throw Error(`Device name exists: ${id}`);
  }

  // Emit packages update
  eventBus.emit(eventBusTag.emitDevices);

  return {
    message: `Added device: ${id}`,
    logMessage: true,
    userAction: true,
  };
}

module.exports = addDevice;
