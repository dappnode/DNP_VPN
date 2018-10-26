const fs = require('fs');
const logs = require('./logs.js')(module);

const dbPath = process.env.DB_PATH || 'db.json';

/**
 * Methods of the exposed wrapper:
 * > All methods are syncronous
 * > If db.get is called and nothing is found return empty
 * > If db.write is called and the db file doesn't exist, create one
 *
 * db.set(key, value)
 * > Write the value in the key
 * db.get()
 * > Return the whole db
 * db.get(key)
 * > Return the content of that key
 */

const get = (key) => {
    try {
        const _db = JSON.parse(fs.readFileSync(dbPath));
        if (key) return _db[key];
        else return _db;
    } catch (e) {
        if (e.code === 'ENOENT') logs.info('db not found');
        else logs.info('db.get error: '+e.stack);
    }
};

const set = (key, value) => {
    try {
        const _db = get() || {};
        _db[key] = value;
        fs.writeFileSync(dbPath, JSON.stringify(_db));
    } catch (e) {
        logs.info('db.set error: '+e.stack);
    }
};

module.exports = {
    set,
    get,
};
