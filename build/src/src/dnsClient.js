const http = require('http');
const https = require('https');
const logs = require('./logs.js')(module);
const EthCrypto = require('eth-crypto');

// DNS server info
const host = 'dyn.dappnode.io';

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
    let subdomain = identity.address.toLowerCase().substr(2).substring(0, 8);
    return {
        ...identity,
        domain: subdomain+'.'+host,
    };
}


function updateIp(privateKey, useHttp = false) {
    // Prepare message
    const timestamp = Math.floor(new Date() / 1000);
    const messageHash = EthCrypto.hash.keccak256(timestamp);
    const signature = EthCrypto.sign(privateKey, messageHash);
    const publicKey = EthCrypto.publicKeyByPrivateKey(privateKey);
    const address = EthCrypto.publicKey.toAddress(publicKey);

    // Send message
    const parameters = [
        `address=${address}`,
        `timestamp=${timestamp}`,
        `sig=${signature}`,
    ];
    const url = `${(useHttp ? 'http' : 'https')}://${host}/?${parameters.join('&')}`;
    httpGetRequest(url, useHttp = false)
    .then((res) => {
        // Deal with the answer
        if (res.code === 200) {
            logs.info(`Successfully updated IP: ${JSON.stringify(res.data)}`);
        } else {
            const errMsg = res.data.message || JSON.stringify(res.data);
            logs.error(`Received code ${res.code} on DNS updateIp call: ${errMsg}`);
        }
    }).catch((err) => {
        logs.error(`Error on DNS updateIp call: ${err.message}`);
    });
}

function httpGetRequest(url, useHttp = false) {
    // Source code from nodejs docs https://nodejs.org/api/http.html#http_http_get_options_callback
    return new Promise((resolve, reject) => {
        (useHttp ? http : https).get(url, (res) => {
        const {statusCode} = res;
        const contentType = res.headers['content-type'];

        if (!/^application\/json/.test(contentType)) {
            // consume response data to free up memory
            res.resume();
            return reject(new Error('Invalid content-type.\n' +
                `Expected application/json but received ${contentType}`));
        }

        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => {rawData += chunk;});
        res.on('end', () => {
            try {
                const parsedData = JSON.parse(rawData);
                resolve({
                    data: parsedData,
                    code: statusCode,
                });
            } catch (e) {
                reject(`Error parsing response: ${e.message}, data: ${rawData}`);
            }
        });
        }).on('error', (e) => {
            reject(`Got error: ${e.message}`);
        });
    });
}

module.exports = updateIp;

