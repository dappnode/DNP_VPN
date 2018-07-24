const res = require('../utils/res');


const VPN_PASSWORD_LENGTH = 20;


function createAddDevice(credentialsFile, generate) {
  return async function addDevice({id}) {
    validateName(id);

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
    let password = generate.password(VPN_PASSWORD_LENGTH);

    // Append credentials to the chap_secrets file
    credentialsArray.push({
      name: id,
      password: password,
      ip: ip,
    });

    await credentialsFile.write(credentialsArray);

    return res.success('Added device '+id);
  };
}


function validateName(newDeviceName) {
  if (newDeviceName == '') throw Error('The new device name cannot be empty');
}


module.exports = createAddDevice;
