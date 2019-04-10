const EthCrypto = require("eth-crypto");
const db = require("../db");
const logs = require("../logs.js")(module);

const corruptedPrivateKeyMessage = `


=====================================================================
    Found corrupted privateKey.
    Reseting DYNDNS subdomain, please update your user's profiles
=====================================================================


`;

/**
 * EthCrypto reference
 *
 * - Create private key
 * const identity = EthCrypto.createIdentity();
 * {
      address: '0x3f243FdacE01Cfd9719f7359c94BA11361f32471',
      privateKey: '0x107be9...',
      publicKey: 'bf1cc315...'
  }
 *
 * - From private key to public key
 * const publicKey = EthCrypto.publicKeyByPrivateKey('0x107be9...);
 * - Publick key to address
 * const address = EthCrypto.publicKey.toAddress('bf1cc315...);
 *
 * - Sign message
 * const message = 'foobar';
   const messageHash = EthCrypto.hash.keccak256(message);
   const signature = EthCrypto.sign(privateKey, messageHash);
 */

// dyndnsHost has to be stripped of http(s):// tag
// process.env.DYNDNS_DOMAIN should include said tag
function getDyndnsHost() {
  const { DYNDNS_DOMAIN } = process.env;
  return DYNDNS_DOMAIN && DYNDNS_DOMAIN.includes("://")
    ? DYNDNS_DOMAIN.split("://")[1]
    : DYNDNS_DOMAIN;
}

function isPrivateKeyValid(privateKey) {
  try {
    EthCrypto.publicKeyByPrivateKey(privateKey);
    return true;
  } catch (e) {
    logs.warn(
      `Private key verification failed. EthCrypto.publicKeyByPrivateKey returned error: ${
        e.stack
      }`
    );
    return false;
  }
}

async function generateKeys() {
  const currentPrivateKey = await db.get("privateKey");
  if (currentPrivateKey) {
    if (isPrivateKeyValid(currentPrivateKey)) {
      logs.info(`Skipping keys generation, found identity in db`);
      return;
    } else {
      logs.warn(corruptedPrivateKeyMessage);
    }
  }
  const { address, privateKey, publicKey } = EthCrypto.createIdentity();
  await db.set("address", address);
  await db.set("privateKey", privateKey);
  await db.set("publicKey", publicKey);
  const subdomain = address
    .toLowerCase()
    .substr(2)
    .substring(0, 16);
  const domain = [subdomain, getDyndnsHost()].join(".");
  await db.set("domain", domain);
}

module.exports = generateKeys;
