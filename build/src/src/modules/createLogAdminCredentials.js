const qrcode = require('qrcode-terminal');


function createLogAdminCredentials(
  credentialsFile,
  getStatusUPnP,
  getStatusExternalIp,
  generate
) {
  return async function logAdminCredentials(VPN) {
    const {result: statusUPnP} = await getStatusUPnP();
    // {
    //   message: 'UPnP status ',
    //   result: {
    //     openPorts: true, // true => ports have to be opened
    //     UPnP: true, // true => UPnP is able to open them automatically
    //     msg: 'UPnP device available',
    //   },
    // }

    const {result: statusExternalIp} = await getStatusExternalIp();
    // {
    //   message: 'External IP status ',
    //   result: {externalIpResolves: true},
    // }

    let deviceList = await credentialsFile.fetch();
    let adminDevice = deviceList[0];
    let adminOtp = generate.otp(adminDevice.name, adminDevice.password, VPN);

    // Show the QR code
    qrcode.setErrorLevel('S');
    qrcode.generate(adminOtp);

    // Show credentials
    /* eslint-disable max-len */
    let msg = `
    To connect to your DAppNode scan the QR above, copy/paste link below into your browser or use VPN credentials:
  
    ${adminOtp}
  
     VPN-Type         IP               PSK                name             password
    L2TP/IPSec  ${VPN.IP}  ${VPN.PSK}  ${adminDevice.name}  ${adminDevice.password}`;

    if (statusUPnP.openPorts && !statusUPnP.UPnP) {
      msg += '\n ALERT: You may not be able to connect. Turn your router\'s UPnP on or open the VPN ports manually';
    }
    if (!statusExternalIp.externalIpResolves) {
      msg += '\n ALERT: If you are connecting from the same network as your DAppNode use the internal IP: '+statusExternalIp.INT_IP;
    }
    /* eslint-enable max-len */

    /* eslint-disable no-console */
    console.log(msg);
    /* eslint-enable no-console */
  };
}


module.exports = createLogAdminCredentials;
