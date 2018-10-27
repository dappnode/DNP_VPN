const level = require('level');

const dbPath = process.env.DB_PATH || './vpndb';

// 1) Create our database, supply location and options.
//    This will create or open the underlying LevelDB store.
const db = level(dbPath);

/**
 * Methods of the exposed wrapper:
 * > All methods are ASYNCronous
 * > If db.get is called and nothing is found return empty
 * > If db.write is called and the db file doesn't exist, create one
 *
 * await db.set(key, value)
 * > Write the value in the key
 * await db.get()
 * > Return the whole db
 * await db.get(key)
 * > Return the content of that key
 */

const get = (key) => {
    if (key) {
        return db.get(key).catch((err) => {
            // handle a 'NotFoundError' by returning null
            if (err.notFound) return;
            else throw err;
        });
    } else {
        return new Promise((resolve, reject) => {
            const _db = {};
            db.createReadStream()
                .on('data', (data) => _db[data.key] = data.value)
                .on('error', reject)
                .on('end', () => resolve(_db));
        });
    }
};

const set = (key, value) => {
    return db.put(key, value);
};

module.exports = {
    set,
    get,
};
