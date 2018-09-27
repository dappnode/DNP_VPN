const EthCrypto = require('eth-crypto');
const fs = require('file-system');
const util = require('util');
const logs = require('../logs.js')(module);

/**
 * EthCrypto reference
 *
 * - Create private key
 * const identity = EthCrypto.createIdentity();
 * {
      address: '0x3f243FdacE01Cfd9719f7359c94BA11361f32471',
      privateKey: '0x107be946709e41b7895eea9f2dacf998a0a9124acbb786f0fd1a826101581a07',
      publicKey: 'bf1cc3154424dc22191941d9f4f50b063a2b663a2337e5548abea633c1d06ece...'
  }
 *
 * - From private key to public key
 * const publicKey = EthCrypto.publicKeyByPrivateKey('0x107be9...);
 * - Publick key to address
 * const address = EthCrypto.publicKey.toAddress('bf1c...);
 *
 * - Sign message
 * const message = 'foobar';
   const messageHash = EthCrypto.hash.keccak256(message);
   const signature = EthCrypto.sign(privateKey, messageHash);
 */

function generateKeys() {
    const identity = EthCrypto.createIdentity();
    const subdomain = identity.address.toLowerCase().substr(2).substring(0, 8);
    const DYNDNS_HOST = process.env.DEV ? 'dyn.test.io' : process.env.DYNDNS_HOST;
    return {
        ...identity,
        domain: subdomain+'.'+DYNDNS_HOST,
    };
}

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

function getKeys() {
    let PATH = process.env.DEV ? './test/keypair' : process.env.KEYPAIR_FILE_PATH;
    if (!PATH) {
        PATH = '/usr/src/app/secrets/keypair';
        logs.warn('KEYPAIR_FILE_PATH is not defined. Defaulting to /usr/src/app/secrets/keypair');
    }
    return readFile(PATH)
    .then(JSON.parse)
    .catch((err) => {
        if (err.code === 'ENOENT') {
            const keydata = generateKeys();
            return writeFile(PATH, JSON.stringify(keydata))
            .then(() => keydata);
        } else {
            logs.error('Error getting keys from '+PATH+': '+ err.stack);
        }
    });
}

module.exports = getKeys;
