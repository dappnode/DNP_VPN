const qrcode = require("qrcode-terminal");

async function generateLoginMsg(url) {
  let msg = "\n\n";

  // Show the QR code
  // Wraps qrcode library's callback style into a promise
  if (!url) throw Error("generateLoginMsg: url is empty or not defined");
  msg += await getQrCodeString(url);

  // Show credentials

  msg += `\n To connect to your DAppNode scan the QR above or copy/paste link below into your browser:
  ${url}\n`;

  if (process.env._DAPPNODE_GLOBAL_UPNP_AVAILABLE && process.env._DAPPNODE_GLOBAL_UPNP_AVAILABLE.trim() == 'false') {
    msg += `\n ALERT: You may not be able to connect. Turn your router's UPnP on or open the VPN port (1194/udp) manually`;
  }
  if (process.env._DAPPNODE_GLOBAL_NO_NAT_LOOPBACK && process.env._DAPPNODE_GLOBAL_NO_NAT_LOOPBACK.trim() == 'false') {
    msg += `\n ALERT: NAT-Loopback is disabled. If you are connecting from the same network as your DAppNode use the internal IP: ${process.env._DAPPNODE_GLOBAL_INTERNAL_IP}`;
  }

  return msg;
}

function getQrCodeString(data) {
  return new Promise(resolve => {
    qrcode.setErrorLevel("S");
    qrcode.generate(data, resolve);
  });
}

module.exports = generateLoginMsg;