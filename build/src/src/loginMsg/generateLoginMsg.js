// const credentialsFile = require('../utils/credentialsFile');
// const generate = require('../utils/generate');
const qrcode = require('qrcode-terminal');
const db = require('../db');
// const getServer = require('../utils/getServer');
const getDeviceCredentials = require('../calls/getDeviceCredentials');


async function generateLoginMsg() {
  let msg = '\n\n';

  const adminUser = process.env.DEFAULT_ADMIN_USER;
  const adminCreds = await getDeviceCredentials({id: adminUser});

  // Show the QR code
  // Wraps qrcode library's callback style into a promise
  msg += await getQrCodeString(adminCreds.result.url);

  // Show credentials
  /* eslint-disable max-len */
  msg += `
To connect to your DAppNode scan the QR above or copy/paste link below into your browser:
  ${adminCreds.result.url}\n`;

  return msg;
}

function getQrCodeString(data) {
  return new Promise((resolve) => {
    qrcode.setErrorLevel('S');
    qrcode.generate(data, resolve);
  });
}

function parseUpnpStatus(openPorts, upnpAvailable) {
  if (openPorts && !upnpAvailable) {
    // upnpStatus: {
    //   openPorts: true, // true => ports have to be opened
    //   upnp: true, // true => UPnP is able to open them automatically
    // },
    return '\n ALERT: You may not be able to connect. '
      +'Turn your router\'s UPnP on or open the VPN port (1194/udp) manually';
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


module.exports = generateLoginMsg;
