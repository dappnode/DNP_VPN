const qrcode = require('qrcode-terminal');


function createLogAdminCredentials(
  credentialsFile,
  generate
) {
  return async function logAdminCredentials(params) {
    const deviceList = await credentialsFile.fetch();
    const adminDevice = deviceList[0];
    const adminOtp = generate.otp({
      server: params.server,
      name: params.name,
      user: adminDevice.name,
      pass: adminDevice.password,
      psk: params.psk,
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
        value: params.psk || '',
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
        value: params.server || '',
      },
    ];
    /* eslint-disable max-len */
    let msg = `
  To connect to your DAppNode scan the QR above, copy/paste link below into your browser or use VPN credentials:
  ${adminOtp}

  ${columns.map((col) => col.field.padEnd(col.value.length)).join('  ')}
  ${columns.map((col) => col.value).join('  ')}`;

    msg += parseUpnpStatus(params);
    msg += parsePublicIpStatus(params);
    /* eslint-enable max-len */

    /* eslint-disable no-console */
    console.log(msg);
    /* eslint-enable no-console */
  };
}

function parseUpnpStatus(params) {
  if (params.upnpStatus.openPorts && !params.upnpStatus.upnp) {
    // upnpStatus: {
    //   openPorts: true, // true => ports have to be opened
    //   upnp: true, // true => UPnP is able to open them automatically
    //   msg: 'UPnP device available',
    // },
    return '\n ALERT: You may not be able to connect. '
      +'Turn your router\'s UPnP on or open the VPN ports (500 and 4500) manually';
  } else {
    return '';
  }
}

function parsePublicIpStatus(params) {
  if (!params.publicIpResolved) {
    return '\n ALERT: (NAT-Loopback disable) '
      +'If you are connecting from the same network as your DAppNode '
      +'use the internal IP: '+params.internalIp;
  } else {
    return '';
  }
}


module.exports = createLogAdminCredentials;
