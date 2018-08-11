

function createListDevices(credentialsFile, generate, params) {
  return async function listDevices() {
    // Fetch devices data from the chap_secrets file
    let deviceList = await credentialsFile.fetch();
    deviceList.forEach(function(credentials) {
      credentials.otp = generate.otp(credentials.name, credentials.password, params.VPN);
    });

    return {
      message: 'Listing '+deviceList.length+' devices',
      logMessage: true,
      result: deviceList,
    };
  };
}


module.exports = createListDevices;
