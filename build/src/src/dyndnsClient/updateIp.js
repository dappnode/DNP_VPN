const httpGetRequest = require('./httpGetRequest');
const EthCrypto = require('eth-crypto');
const getKeys = require('./getKeys');
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


/**
 * Gets the keys from the local file or creates new ones and stores them.
 * Then it does a GET request to the dyndns server to update the record
 *
 * @return {String} the domain, from the server.
 * Example: 2dc4e4f6.dyndns.greyfaze.net
 */
function updateIp() {
    // get keys
    return getKeys().then((identity) => {
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
            //     'domain': '2dc4e4f6.dyndns.greyfaze.net',
            //     'message': 'Your dynamic domain 2dc4e4f6.dyndns.greyfaze.net
            //          has been updated to 63.84.220.164',
            // };
            if (res.code === 200) {
                logs.info(`dyndns client success: ${data.message}`);
                return data.domain;
            } else {
                const errorMsg = data.message || JSON.stringify(data);
                logs.error(`dyndns client error code ${res.code}: ${errorMsg}`);
            }
        }).catch((err) => {
            logs.error(`httpGetRequest error: ${err.stack || err.message}`);
        });
    });
}

module.exports = updateIp;

