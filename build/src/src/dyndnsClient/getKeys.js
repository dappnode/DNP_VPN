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
const {DEV, DYNDNS_HOST} = process.env;
const dyndnsHost = DEV
    ? 'dyn.test.io'
    : (DYNDNS_HOST && DYNDNS_HOST.includes('://'))
        ? DYNDNS_HOST.split('://')[1]
        : DYNDNS_HOST;

function generateKeys() {
    const identity = EthCrypto.createIdentity();
    const subdomain = identity.address.toLowerCase().substr(2).substring(0, 16);
    return {
        ...identity,
        domain: subdomain+'.'+dyndnsHost,
    };
}

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

function getKeys() {
    let path = process.env.DEV ? './mockFiles/keypair' : process.env.KEYPAIR_PATH;
    if (!path) {
        path = '/usr/src/app/secrets/keypair';
        logs.warn('KEYPAIR_FILE_path is not defined. Defaulting to /usr/src/app/secrets/keypair');
    }
    return readFile(path)
    .then(JSON.parse)
    .catch((err) => {
        if (err.code === 'ENOENT') {
            const keydata = generateKeys();
            return writeFile(path, JSON.stringify(keydata))
            .then(() => keydata);
        } else {
            logs.error('Error getting keys from '+path+': '+ err.stack);
        }
    });
}

module.exports = getKeys;
