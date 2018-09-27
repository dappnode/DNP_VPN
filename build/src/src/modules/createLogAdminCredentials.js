const qrcode = require('qrcode-terminal');


function createLogAdminCredentials(
  credentialsFile,
  generate
) {
  return async function logAdminCredentials(VPN) {
    const deviceList = await credentialsFile.fetch();
    const adminDevice = deviceList[0];
    const adminOtp = generate.otp({
      server: VPN.server,
      name: VPN.name,
      user: adminDevice.name,
      pass: adminDevice.password,
      psk: VPN.PSK,
    });

    // Show the QR code
    qrcode.setErrorLevel('S');
    qrcode.generate(adminOtp);

    // Show credentials
    const columns = [
      {
        field: 'VPN-Type',
        value: 'L2TP/IPSec',
      },
      {
        field: 'PSK',
        value: VPN.PSK || '',
      },
      {
        field: 'name',
        value: adminDevice.name || '',
      },
      {
        field: 'password',
        value: adminDevice.password || '',
      },
      {
        field: 'IP',
        value: VPN.server || '',
      },
    ];
    /* eslint-disable max-len */
    let msg = `
  To connect to your DAppNode scan the QR above, copy/paste link below into your browser or use VPN credentials:
  ${adminOtp}

  ${columns.map((col) => col.field.padEnd(col.value.length)).join('  ')}
  ${columns.map((col) => col.value).join('  ')}`;

    msg += parseUpnpStatus(VPN);
    msg += parsePublicIpStatus(VPN);
    /* eslint-enable max-len */

    /* eslint-disable no-console */
    console.log(msg);
    /* eslint-enable no-console */
  };
}

function parseUpnpStatus(VPN) {
  if (VPN.UPNP_STATUS.openPorts && !VPN.UPNP_STATUS.UPnP) {
    // UPNP_STATUS: {
    //   openPorts: true, // true => ports have to be opened
    //   UPnP: true, // true => UPnP is able to open them automatically
    //   msg: 'UPnP device available',
    // },
    return '\n ALERT: You may not be able to connect. '
      +'Turn your router\'s UPnP on or open the VPN ports (500 and 4500) manually';
  } else {
    return '';
  }
}

function parsePublicIpStatus(VPN) {
  if (!VPN.PUB_IP_RESOLVED) {
    // EXTERNALIP_STATUS: {
    //   externalIpResolves: true,
    //   INT_IP: INT_IP,
    // }
    return '\n ALERT: (NAT-Loopback disable) '
      +'If you are connecting from the same network as your DAppNode '
      +'use the internal IP: '+VPN.INT_IP;
  } else {
    return '';
  }
}


module.exports = createLogAdminCredentials;
