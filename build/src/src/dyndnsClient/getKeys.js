const EthCrypto = require('eth-crypto');
const db = require('../db');

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
// process.env.DYNDNS_HOST should include said tag
function getDyndnsHost() {
    const {DYNDNS_HOST} = process.env;
    return DYNDNS_HOST && DYNDNS_HOST.includes('://')
        ? DYNDNS_HOST.split('://')[1]
        : DYNDNS_HOST;
}


function generateKeys() {
    const identity = EthCrypto.createIdentity();
    const subdomain = identity.address.toLowerCase().substr(2).substring(0, 16);
    return {
        ...identity,
        domain: subdomain+'.'+getDyndnsHost(),
    };
}

function getKeys() {
    const currentKeypair = db.get('keypair').value();
    if (currentKeypair) {
        return currentKeypair;
    } else {
        const newKeypair = generateKeys();
        db.set('keypair', newKeypair).write();
        db.set('domain', newKeypair.domain).write();
        return newKeypair;
    }
}

module.exports = getKeys;
