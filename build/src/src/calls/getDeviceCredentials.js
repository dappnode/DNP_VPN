const {secretbox, randomBytes} = require('tweetnacl');
const generator = require('generate-password');
const shell = require('../utils/shell');
const fs = require('fs');

const fetchCredsCommand = '/usr/local/bin/ovpn_getclient';
const credentialsDir = '/var/spool/openvpn';

const newNonce = () => randomBytes(secretbox.nonceLength);
const generateKey = () => Buffer.from(randomBytes(secretbox.keyLength)).toString('base64');

const encrypt = (file, key) => {
  const keyUint8Array = Buffer.from(key, 'base64');
  const nonce = newNonce();
  const messageUint8 = Buffer.from(file, 'utf8');
  const box = secretbox(messageUint8, nonce, keyUint8Array);

  const fullMessage = new Uint8Array(nonce.length + box.length);
  fullMessage.set(nonce);
  fullMessage.set(box, nonce.length);

  const base64FullMessage = Buffer.from(fullMessage).toString('base64');
  return base64FullMessage;
};

async function generate({id}) {
  // Check if id exists.

  const key = generateKey();
  const data = await shell(`${fetchCredsCommand} ${id}`);
  const encrypted = encrypt(data, key);
  // save as random filename
  const filename = generator.generate({length: 16, numbers: true});
  await fs.writeFileSync(`${credentialsDir}/${filename}`, encrypted);
  return {
    message: `Generated credentials for ${id} at ${credentialsDir}/${filename} with ${key}`,
    logMessage: true,
    result: {filename, key},
  };
}

module.exports = {generate};

