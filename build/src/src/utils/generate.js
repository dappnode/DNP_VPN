const generator = require("generate-password");
const db = require("../db");
const getPublicEndpoint = require("./getPublicEndpoint");

const dappnodeOtpUrl = process.env.DAPPNODE_OTP_URL || "otp.dappnode.io";
const commonStaticIpPrefix = "172.33.";
const userStaticIpPrefix = "172.33.100.";
const userStaticIpFirstOctet = 2;
const userStaticIpLastOctet = 250;

function ip(ips) {
  const firstOctet = userStaticIpFirstOctet;
  const lastOctet = userStaticIpLastOctet;

  // Get the list of used octets
  let usedIpOctets = ips.reduce((usedIpOctets, ip) => {
    if (ip.includes(commonStaticIpPrefix)) {
      let octetArray = ip.trim().split(".");
      let endingOctet = octetArray[octetArray.length - 1];
      usedIpOctets.push(parseFloat(endingOctet));
    }
    return usedIpOctets;
  }, []);
  // Compute a consecutive list of integers from firstOctet to lastOctet
  let possibleIpOctets = fillRange(firstOctet, lastOctet);
  // Compute the available octets by computing the difference
  let availableOctets = diffArrays(possibleIpOctets, usedIpOctets);
  // Alert the user if there are no available octets
  if (availableOctets.length < 1) {
    throw Error(
      "No available IP addresses. Consider deleting old or unused devices"
    );
  }
  // Chose the smallest available octet
  let chosenOctet = Math.min.apply(null, availableOctets);

  return userStaticIpPrefix + chosenOctet;
}

function password(passwordLength) {
  return generator.generate({
    length: passwordLength,
    numbers: true
  });
}

const encode = {
  // To optimize the server address, if a hex string is passed
  // it is assumed to be the subdomain of the default dyndns provider
  server: input => (input || "").split(".dyndns.dappnode.io")[0],
  psk: input => input,
  // If no user is provided, assume it is the default admin user
  user: input => (input === "dappnode_admin" ? "" : input),
  pass: input => input,
  name: input => input
};

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
 * @param {Object}: {
 *   min: true // ignores the server name and url protocol to save space
 * }
 * @return {String} otp link
 */
async function otp({ user, pass }, { min } = {}) {
  const server = await getPublicEndpoint();
  const name = await db.get("name");
  const psk = await db.get("psk");

  const otpCredentials = {
    server,
    name: min ? "" : name,
    user,
    pass,
    psk
  };

  const otpEncoded = [
    encode.server(otpCredentials.server),
    encode.psk(otpCredentials.psk),
    encode.user(otpCredentials.user),
    encode.pass(otpCredentials.pass),
    encode.name(otpCredentials.name)
  ]
    .map(encodeURIComponent)
    .join("&");

  let otpUrl = dappnodeOtpUrl;

  return `${otpUrl}#${otpEncoded}`;
}

// /////////////////////
// Utility functions //
// /////////////////////

function diffArrays(a1, a2) {
  return a1.filter(i => a2.indexOf(i) < 0);
}

function fillRange(start, end) {
  return Array(end - start + 1)
    .fill()
    .map((item, index) => start + index);
}

module.exports = {
  ip,
  password,
  otp
};
