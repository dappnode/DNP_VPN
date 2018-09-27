

const vpnPasswordLength = 20;


function createAddDevice(credentialsFile, generate) {
  return async function addDevice({id}) {
    if (id === '') {
      throw Error('The new device name cannot be empty');
    }
    if (id === '#') {
      throw Error('The new device name cannot be #');
    }

    // Fetch devices data from the chap_secrets file
    let credentialsArray = await credentialsFile.fetch();
    let deviceNamesArray = credentialsArray.map((credentials) => credentials.name);
    let deviceIPsArray = credentialsArray.map((credentials) => credentials.ip);

    // Check if device name is unique
    if (deviceNamesArray.includes(id)) {
      throw Error('Device name exists: '+id);
    }

    // Generate credentials
    let ip = await generate.ip(deviceIPsArray);
    let password = generate.password(vpnPasswordLength);

    // Append credentials to the chap_secrets file
    credentialsArray.push({
      name: id,
      password: password,
      ip: ip,
    });

    await credentialsFile.write(credentialsArray);

    return {
      message: 'Added device '+id,
      logMessage: true,
      userAction: true,
    };
  };
}


module.exports = createAddDevice;
