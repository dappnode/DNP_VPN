const logs = require('./logs.js')(module);
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const dbPath = process.env.DB_PATH || 'db.json';
const adapter = new FileSync(dbPath);
const db = low(adapter);
logs.info(`Starting lowdb at path ${dbPath}`);

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
