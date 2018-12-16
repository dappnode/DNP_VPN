const getUserList = require('../utils/getUserList');
const getCCD = require('../utils/getCCD');

async function listDevices() {
    const userList = await getUserList.fetch();
    const ccd = await getCCD.fetch();
    var deviceList = []

    userList.forEach((user) => {
      deviceList.push({id: user,admin: ccd.some((obj) => obj.cn === user)});
     });

    return {
      message: 'Listing '+deviceList.length+' devices',
      logMessage: true,
      result: deviceList,
    };
  }
   
  module.exports = listDevices;
  