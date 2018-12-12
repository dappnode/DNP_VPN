const getUserList = require('../utils/getUserList');

async function listDevices() {
    let deviceList = await getUserList.fetch();
  
    return {
      message: 'Listing '+deviceList.length+' devices',
      logMessage: true,
      result: deviceList,
    };
  }
  
  
  module.exports = listDevices;
  