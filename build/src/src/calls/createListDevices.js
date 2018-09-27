

function createListDevices(credentialsFile, generate, getParams) {
  return async function listDevices() {
    const params = getParams();
    // Fetch devices data from the chap_secrets file
    let deviceList = await credentialsFile.fetch();
    for (const credentials of deviceList) {
      credentials.otp = generate.otp({
        server: params.server,
        name: params.name,
        user: credentials.name,
        pass: credentials.password,
        psk: params.psk,
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
