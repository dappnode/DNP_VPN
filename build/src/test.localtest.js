const qrcode = require('qrcode-terminal')
const adminOtp = 'http://in324oi2n34in32o4in23oi4n23oi42oi3n4oun234iun23iu4n23iu4ni23un4iu4ni4u32n4iu23n42j23n4j23n4k23jnk324jn2k3j43iun4i234ui23n4o'
const VPN_IP = '123.45.67.189'
const VPN_PSK = '12345678901234567890'
const adminDevice = {
  name: 'dappnode_admin',
  password: '12345678901234567890'
}
// Show the QR code
qrcode.setErrorLevel('S');
qrcode.generate(adminOtp);

// Show credentials
console.log(`
To connect to your DAppNode scan the QR above, copy/paste link below into your browser or use VPN credentials:

${adminOtp}

 VPN-Type         IP               PSK                name             password
L2TP/IPSec  ${VPN_IP}  ${VPN_PSK}  ${adminDevice.name}  ${adminDevice.password}`)
