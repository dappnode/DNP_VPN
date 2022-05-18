"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = exports.generateKey = void 0;
const tweetnacl_1 = require("tweetnacl");
/**
 * Generates a tweetnacl key at the predefined `secretbox.keyLength`
 */
function generateKey() {
    return Buffer.from(tweetnacl_1.randomBytes(tweetnacl_1.secretbox.keyLength)).toString("base64");
}
exports.generateKey = generateKey;
function encrypt(data, key) {
    const keyUint8Array = Buffer.from(key, "base64");
    const nonce = tweetnacl_1.randomBytes(tweetnacl_1.secretbox.nonceLength);
    const messageUint8 = Buffer.from(data, "utf8");
    const box = tweetnacl_1.secretbox(messageUint8, nonce, keyUint8Array);
    const fullMessage = new Uint8Array(nonce.length + box.length);
    fullMessage.set(nonce);
    fullMessage.set(box, nonce.length);
    const base64FullMessage = Buffer.from(fullMessage).toString("base64");
    return base64FullMessage;
}
exports.encrypt = encrypt;
//# sourceMappingURL=encrypt.js.map