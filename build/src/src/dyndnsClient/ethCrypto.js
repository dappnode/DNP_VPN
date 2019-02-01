const secp256k1 = require('secp256k1');
const crypto = require('crypto');
const ethereumjsUtil = require('ethereumjs-util');
const EthCrypto = require('eth-crypto');

/**
 * Attempt to replace Eth-Crypto by it's native module: ethereum-util
 */

function toBuff(s) {
    if (!s) throw Error('toBuff requires one parameter');
    if (typeof s === 'string') s = s.replace('0x', '');
    return Buffer.from(s, 'hex');
}

// =================================
// =================================
// =================================
// =================================
// Works but the hashing function used by ethereumjs-util is slightly different from the one
// used by EthCrypto resulting in incompatible messages.

function sign(message, privateKey) {
    const messageHash = ethereumjsUtil.keccak256(toBuff(message));
    const signature = ethereumjsUtil.ecsign(messageHash, toBuff(privateKey));
    signature.v = Buffer.from([signature.v]);
    const {r, s, v} = signature;
    const signatureHex = Buffer.concat([r, s, v]).toString('hex');
    console.log({
        messageHash: messageHash.toString('hex'),
        signatureHex,
        privateKey,
    });
}

function signEthCrypto(message, privateKey) {
    const messageHash = EthCrypto.hash.keccak256(message);
    const signature = EthCrypto.sign(privateKey, messageHash);
    console.log({
        messageHash,
        signature,
        privateKey,
    });
    // const publicKey = EthCrypto.publicKeyByPrivateKey(privateKey);
    // const address = EthCrypto.publicKey.toAddress(publicKey);
}

const privateKey = crypto.randomBytes(32).toString('hex');
const message = 'msg';
sign(message, privateKey);
signEthCrypto(message, privateKey);
