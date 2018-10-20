const logs = require('./logs.js')(module);
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const dbPath = process.env.DB_PATH || 'db.json';
const adapter = new FileSync(dbPath);
const db = low(adapter);

// Compute db size for debugging purposes
let dbSize;
try {
    dbSize = JSON.stringify(db.getState() || {}).length;
} catch (e) {
    logs.warn(`Error computing dbSize: ${e.stack}`);
}
logs.info(`Starting lowdb at path ${dbPath}, size: ${dbSize} bytes`);

/**
 * How to use:
 *
 * SET
 * ===
 * db.set('user.name', 'typicode').write()
 *
 * GET
 * ===
 * Requesting not existing values will never throw errors but return undefined
 *
 * db.get('posts').find({ id: 1 }).value()
 *
 */

module.exports = db;
