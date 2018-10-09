const credentialsFile = require('./utils/credentialsFile');
const generate = require('./utils/generate');
const qrcode = require('qrcode-terminal');
const db = require('./db');
const getServer = require('./utils/getServer');

async function logAdminCredentials() {
  const deviceList = await credentialsFile.fetch();
  const adminDevice = deviceList[0];
  const adminOtp = generate.otp({
    user: adminDevice.name,
    pass: adminDevice.password,
  });

  // Show the QR code
  qrcode.setErrorLevel('S');
  qrcode.generate(adminOtp);

  // Show credentials
  const server = getServer();
  const psk = db.get('psk').value();
  const columns = [
    {
      field: 'VPN-Type',
      value: 'L2TP/IPSec',
    },
    {
      field: 'PSK',
      value: psk || '',
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
      value: server || '',
    },
  ];
  /* eslint-disable max-len */
  let msg = `
To connect to your DAppNode scan the QR above, copy/paste link below into your browser or use VPN credentials:
${adminOtp}

${columns.map((col) => col.field.padEnd(col.value.length)).join('  ')}
${columns.map((col) => col.value).join('  ')}`;

  const openPorts = db.get('openPorts').value();
  const upnpAvailable = db.get('upnpAvailable').value();
  const externalIpResolves = db.get('externalIpResolves').value();
  const internalIp = db.get('internalIp').value();
  msg += parseUpnpStatus(openPorts, upnpAvailable);
  msg += parsePublicIpStatus(externalIpResolves, internalIp);
  /* eslint-enable max-len */

  /* eslint-disable no-console */
  console.log(msg);
  /* eslint-enable no-console */
}

function parseUpnpStatus(openPorts, upnpAvailable) {
  if (openPorts && !upnpAvailable) {
    // upnpStatus: {
    //   openPorts: true, // true => ports have to be opened
    //   upnp: true, // true => UPnP is able to open them automatically
    // },
    return '\n ALERT: You may not be able to connect. '
      +'Turn your router\'s UPnP on or open the VPN ports (500 and 4500) manually';
  } else {
    return '';
  }
}

function parsePublicIpStatus(externalIpResolves, internalIp) {
  if (!externalIpResolves) {
    return '\n ALERT: (NAT-Loopback disable) '
      +'If you are connecting from the same network as your DAppNode '
      +'use the internal IP: '+internalIp;
  } else {
    return '';
  }
}


module.exports = logAdminCredentials;
