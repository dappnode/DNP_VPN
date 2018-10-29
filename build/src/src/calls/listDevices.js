const credentialsFile = require('../utils/credentialsFile');
const generate = require('../utils/generate');

async function listDevices() {
  // Fetch devices data from the chap_secrets file
  let deviceList = await credentialsFile.fetch();
  for (const credentials of deviceList) {
    credentials.otp = await generate.otp({
      user: credentials.name,
      pass: credentials.password,
    });
  }

  return {
    message: 'Listing '+deviceList.length+' devices',
    logMessage: true,
    result: deviceList,
  };
}


module.exports = listDevices;
