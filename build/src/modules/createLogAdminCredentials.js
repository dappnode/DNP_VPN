const qrcode = require('qrcode-terminal')


function createLogAdminCredentials(credentialsFile, generate) {

  return async function logAdminCredentials(VPN) {

    let deviceList = await credentialsFile.fetch()
    let adminDevice = deviceList[0]
    let adminOtp = generate.otp(adminDevice.name, adminDevice.password, VPN)

    // Show the QR code
    qrcode.setErrorLevel('S');
    qrcode.generate(adminOtp);

    // Show credentials
    console.log(`
  To connect to your DAppNode scan the QR above, copy/paste link below into your browser or use VPN credentials:

  ${adminOtp}

   VPN-Type         IP               PSK                name             password
  L2TP/IPSec  ${VPN.IP}  ${VPN.PSK}  ${adminDevice.name}  ${adminDevice.password}`)

  }
}


module.exports = createLogAdminCredentials
