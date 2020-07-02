import { secretbox, randomBytes } from "tweetnacl";

function newNonce() {
  return randomBytes(secretbox.nonceLength);
}

export function generateKey() {
  return Buffer.from(randomBytes(secretbox.keyLength)).toString("base64");
}

export function encrypt(data: string, key: string) {
  const keyUint8Array = Buffer.from(key, "base64");
  const nonce = newNonce();
  const messageUint8 = Buffer.from(data, "utf8");
  const box = secretbox(messageUint8, nonce, keyUint8Array);

  const fullMessage = new Uint8Array(nonce.length + box.length);
  fullMessage.set(nonce);
  fullMessage.set(box, nonce.length);

  const base64FullMessage = Buffer.from(fullMessage).toString("base64");
  return base64FullMessage;
}
