const httpGetRequest = require('./httpGetRequest');
const EthCrypto = require('eth-crypto');
const logs = require('../logs.js')(module);
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


/**
 * Gets the keys from the local file or creates new ones and stores them.
 * Then it does a GET request to the dyndns server to update the record
 *
 * @return {String} the domain, from the server.
 * Example: 1234abcd1234acbd.dyndns.dappnode.io
 *
 */
function updateIp() {
    // get keys
    const identity = db.get('keypair').value();

    // From identity
    const {privateKey} = identity;

    // Prepare message
    const timestamp = Math.floor(new Date() / 1000);
    const messageHash = EthCrypto.hash.keccak256(timestamp.toString());
    const signature = EthCrypto.sign(privateKey, messageHash);
    const publicKey = EthCrypto.publicKeyByPrivateKey(privateKey);
    const address = EthCrypto.publicKey.toAddress(publicKey);

    // Send message
    const parameters = [
        `address=${address}`,
        `timestamp=${timestamp}`,
        `sig=${signature}`,
    ];
    // dyndnsHost has to contain http(s):// tag
    // process.env.DYNDNS_HOST should include said tag
    const dyndnsHost = process.env.DYNDNS_HOST;
    const url = `${dyndnsHost}/?${parameters.join('&')}`;

    return httpGetRequest(url, {format: 'json'})
    .then((res) => {
        const data = res.data || {};
        // Deal with the answer
        // Sample res:
        // res.data = {
        //     'ip': '63.84.220.164',
        //     'domain': '1234abcd1234acbd.dyndns.dappnode.io',
        //     'message': 'Your dynamic domain 1234abcd1234acbd.dyndns.dappnode.io
        //          has been updated to 63.11.22.164',
        // };
        if (res.code === 200) {
            logs.info(`dyndns client success: ${data.message}`);
            return data.domain;
        } else {
            const errorMsg = data.message || JSON.stringify(data);
            logs.error(`dyndns client error code ${res.code}: ${errorMsg}`);
        }
    })
    .then((domain) => {
        db.set('domain', domain).write();
        db.set('registeredToDyndns', true).write();
    })
    .catch((err) => {
        logs.error(`httpGetRequest error: ${err.stack || err.message}`);
    });
}

module.exports = updateIp;

