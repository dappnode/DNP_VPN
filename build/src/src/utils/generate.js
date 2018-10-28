const base64url = require('base64url');
const generator = require('generate-password');
const db = require('../db');
const getServer = require('./getServer');

const dappnodeOtpUrl = process.env.DAPPNODE_OTP_URL;
const commonStaticIpPrefix = '172.33.';
const userStaticIpPrefix = '172.33.100.';
const userStaticIpFirstOctet = 2;
const userStaticIpLastOctet = 250;


function ip(ips) {
  const firstOctet = userStaticIpFirstOctet;
  const lastOctet = userStaticIpLastOctet;

  // Get the list of used octets
  let usedIpOctets = ips.reduce((usedIpOctets, ip) => {
    if (ip.includes(commonStaticIpPrefix)) {
      let octetArray = ip.trim().split('.');
      let endingOctet = octetArray[octetArray.length - 1];
      usedIpOctets.push(parseFloat(endingOctet));
    }
    return usedIpOctets;
  }, []);
  // Compute a consecutive list of integers from firstOctet to lastOctet
  let possibleIpOctets = fillRange(firstOctet, lastOctet);
  // Compute the available octets by computing the difference
  let availableOctets = possibleIpOctets.diff( usedIpOctets );
  // Alert the user if there are no available octets
  if (availableOctets.length < 1) {
    throw Error('No available IP addresses. Consider deleting old or unused devices');
  }
  // Chose the smallest available octet
  let chosenOctet = Math.min.apply(null, availableOctets);

  return userStaticIpPrefix + chosenOctet;
}


function password(passwordLength) {
  return generator.generate({
    length: passwordLength,
    numbers: true,
  });
}


/**
 * Leaving the object destructuring to ensure no extra parameters
 * are included in the link
 *
 * @param {Object} credentials
 * {
 *   'server': server,
 *   'name': name,
 *   'user': user,
 *   'pass': pass,
 *   'psk': psk,
 * }
 *
 * @return {String} otp link
 */
async function otp({user, pass}) {
    const server = await getServer();
    const name = await db.get('name');
    const psk = await db.get('psk');

    const otpCredentials = {
      server,
      name,
      user,
      pass,
      psk,
    };

    const otpCredentialsEncoded = base64url.encode(JSON.stringify(otpCredentials));
    return dappnodeOtpUrl + '#otp=' + otpCredentialsEncoded;
}


// /////////////////////
// Utility functions //
// /////////////////////

/* eslint-disable no-extend-native */
Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};
/* eslint-enable no-extend-native */


const fillRange = (start, end) => {
  return Array(end - start + 1).fill().map((item, index) => start + index);
};


module.exports = {
  ip,
  password,
  otp,
};
