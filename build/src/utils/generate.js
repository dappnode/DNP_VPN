const base64url = require('base64url')
const generator = require('generate-password')


const DAPPNODE_OTP_URL = process.env.DEV ? 'https://localhost:3000/' : process.env.DAPPNODE_OTP_URL
const COMMON_STATIC_IP_PREFIX = '172.33.'
const USER_STATIC_IP_FIRST_OCTET = 2
const USER_STATIC_IP_LAST_OCTET = 250


function ip(deviceIPsArray) {

  const ipPrefix = COMMON_STATIC_IP_PREFIX
  const firstOctet = USER_STATIC_IP_FIRST_OCTET
  const lastOctet = USER_STATIC_IP_LAST_OCTET

  // Get the list of used octets
  let usedIpOctets = deviceIPsArray.reduce((usedIpOctets, ip) => {
    if (ip.includes(ipPrefix)) {
      let octetArray = ip.trim().split('.')
      let endingOctet = octetArray[octetArray.length - 1]
      usedIpOctets.push(parseFloat(endingOctet))
    }
    return usedIpOctets
  }, [])
  // Compute a consecutive list of integers from firstOctet to lastOctet
  let possibleIpOctets = fillRange(firstOctet, lastOctet)
  // Compute the available octets by computing the difference
  let availableOctets = possibleIpOctets.diff( usedIpOctets )
  // Alert the user if there are no available octets
  if (availableOctets.length < 1) {
    throw Error('No available IP addresses. Consider deleting old or unused devices')
  }
  // Chose the smallest available octet
  let chosenOctet = Math.min.apply(null, availableOctets)

  return ipPrefix+chosenOctet

}


function password(passwordLength) {

  return generator.generate({
    length: passwordLength,
    numbers: true
  })

}


function otp(deviceName, password, VPN) {

    let otpCredentials = {
      'server': VPN.IP,
      'name': VPN.NAME,
      'user': deviceName,
      'pass': password,
      'psk': VPN.PSK
    }

    let otpCredentialsEncoded = base64url.encode(JSON.stringify(otpCredentials))
    return DAPPNODE_OTP_URL + '#otp=' + otpCredentialsEncoded

}


///////////////////////
// Utility functions //
///////////////////////


Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0})
}


const fillRange = (start, end) => {
  return Array(end - start + 1).fill().map((item, index) => start + index)
}



module.exports = {
  ip,
  password,
  otp
}
