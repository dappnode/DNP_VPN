import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";
nacl.util = naclUtil;

const nonceLength = nacl.secretbox.nonceLength;

export default function decrypt(data, key) {
  try {
    let keyUint8Array, messageWithNonceAsUint8Array
    try {
      keyUint8Array = nacl.util.decodeBase64(key);
    } catch(e) {
      console.log({data, key})
      throw Error(`Error decoding key from base64: ${e.message}`)
    }
    try {
      messageWithNonceAsUint8Array = nacl.util.decodeBase64(data);
    } catch(e) {
      console.log({data, key})
      throw Error(`Error decoding data from base64: ${e.message}`)
    }
    const nonce = messageWithNonceAsUint8Array.slice(0, nonceLength);
    const message = messageWithNonceAsUint8Array.slice(
      nonceLength,
      data.length
    );
    const decrypted = nacl.secretbox.open(message, nonce, keyUint8Array);
    if (!decrypted) {
      throw Error("Could not decrypt message");
    }
    try {
      return nacl.util.encodeUTF8(decrypted);
    } catch(e) {
      console.log({decrypted})
      throw Error(`Error encoding decrypted result to UTF-8: ${e.message}`)
    }
  } catch (e) {
    e.message = `Error decoding encrypted data: ${e.message}`;
    throw e;
  }
}

// For debugging purposes
window.decrypt = decrypt
