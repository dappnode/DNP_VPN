const { secretbox, randomBytes } = require("tweetnacl");
const crypto = require("crypto");
const fs = require("fs");
const db = require("../db");
const getClient = require("../utils/getClient");

const credentialsDir = process.env.DEV
  ? "./mockFiles/creds"
  : process.env.OPENVPN_CRED_DIR;
const credentialsPort = process.env.DEV
  ? "8090"
  : process.env.OPENVPN_CRED_PORT;

const newNonce = () => randomBytes(secretbox.nonceLength);
const generateKey = () =>
  Buffer.from(randomBytes(secretbox.keyLength)).toString("base64");

const encrypt = (file, key) => {
  const keyUint8Array = Buffer.from(key, "base64");
  const nonce = newNonce();
  const messageUint8 = Buffer.from(file, "utf8");
  const box = secretbox(messageUint8, nonce, keyUint8Array);

  const fullMessage = new Uint8Array(nonce.length + box.length);
  fullMessage.set(nonce);
  fullMessage.set(box, nonce.length);

  const base64FullMessage = Buffer.from(fullMessage).toString("base64");
  return base64FullMessage;
};

/**
 * Creates a new OpenVPN credentials file, encrypted.
 * The filename is the (16 chars short) result of hashing the generated salt in the db,
 * concatenated with the device id.
 *
 * @param {Object} kwargs: {id}
 * @return {Object} A formated success message.
 * result:
 *   {
 *     filename, <String>
 *     key, <String>
 *   }
 */
async function getDeviceCredentials({ id }) {
  const key = generateKey();

  const data = await getClient(id);
  const encrypted = encrypt(data, key);
  const _db = await db.get();
  // Check if static ip
  const hostname = _db.staticIp || _db.domain;

  if (!_db.salt) throw Error("Salt not present.");

  const filename = crypto
    .createHash("sha256")
    .update(_db.salt + id)
    .digest("hex")
    .substring(0, 16);
  await fs.writeFileSync(`${credentialsDir}/${filename}`, encrypted);
  const url = `http://${hostname}:${credentialsPort}/?id=${filename}#${encodeURIComponent(
    key
  )}`;
  return {
    message: `Generated credentials for ${id} at ${credentialsDir}/${filename}`,
    logMessage: true,
    result: { filename, key, url }
  };
}

module.exports = getDeviceCredentials;
