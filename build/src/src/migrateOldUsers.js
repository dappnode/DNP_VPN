#!/usr/bin/env node

const credentialsFile = require("./utils/credentialsFile");
const getUserList = require("./utils/getUserList");
const toggleAdmin = require("./calls/toggleAdmin");
const logs = require("./logs.js")(module);
const addDevice = require("./calls/addDevice");
const fs = require("fs");

const { DEFAULT_ADMIN_USER, CHAP_SECRETS_PATH } = process.env;

async function migrateOldUsers() {
  try {
    const users = await getUserList();

    const devices = credentialsFile
      .fetch(CHAP_SECRETS_PATH)
      .filter(({ name }) => name !== DEFAULT_ADMIN_USER)
      .filter(({ name }) => name !== 'Guests')
      .filter(({ name }) => !users.includes(name))

      for (const {name, ip} of devices) {
        try {
          await addDevice({ id: name });
          if (ip.includes("172.33.10.")) {
            await toggleAdmin({ id: name });
            logs.info(`Migrated ADMIN user: ${name}`);
          } else {
            logs.info(`Migrated non-admin user: ${name}`);
          }
        } catch (e) {
          logs.error(`Error on migrate user ${name}: ${e.stack}`);
        }
      }
    await fs.renameSync(CHAP_SECRETS_PATH, CHAP_SECRETS_PATH + ".old");
    logs.info(
      `Moved chap secrets from ${CHAP_SECRETS_PATH} to ${CHAP_SECRETS_PATH}.old`
    );
  } catch (err) {
    if (err.code === "ENOENT")
      logs.info(`No CHAP secrets found, skipping migration`);
    else logs.error(`Error on migrate old users: ${err.stack || err.message}`);
  }
}

migrateOldUsers().then();
