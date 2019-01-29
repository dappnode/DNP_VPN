const credentialsFile = require('./utils/credentialsFile');

const {DEFAULT_ADMIN_USER, CHAP_SECRETS_PATH} = process.env

async function migrateOldUsers() {
    try {
        credentialsFile.fetch(CHAP_SECRETS_PATH)
        .filter(({name}) => name !== DEFAULT_ADMIN_USER)
        .forEach(({name, ip}) => {
            vpncli.add(name)
            if (ip.includes("172.33.10.")) {
                vpncli.toggle(name)
                logs.info(`Migrated ADMIN user: ${name}`)
            } else {
                logs.info(`Migrated non-admin user: ${name}`)
            }
        })
        await shell(`mv ${CHAP_SECRETS_PATH} ${CHAP_SECRETS_PATH}.old`)
        logs.info(`Moved chap secrets from ${CHAP_SECRETS_PATH} to ${CHAP_SECRETS_PATH}.old to prevent double migrations`)
    } catch (e) {
        if (err.code === 'ENOENT') logs.info(`No CHAP secrets found, skipping migration`);
        else logs.error(`Error on migrate old users: ${err.stack || err.message}`);
    }
}

module.exports = migrateOldUsers;
