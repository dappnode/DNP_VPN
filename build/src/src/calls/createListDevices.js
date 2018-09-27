

function createListDevices(credentialsFile, generate, params) {
  return async function listDevices() {
    // Fetch devices data from the chap_secrets file
    let deviceList = await credentialsFile.fetch();
    for (const credentials of deviceList) {
      credentials.otp = generate.otp({
        server: params.VPN.server,
        name: params.VPN.name,
        user: credentials.name,
        pass: credentials.password,
        psk: params.VPN.PSK,
      });
    }

    return {
      message: 'Listing '+deviceList.length+' devices',
      logMessage: true,
      result: deviceList,
    };
  };
}


module.exports = createListDevices;
