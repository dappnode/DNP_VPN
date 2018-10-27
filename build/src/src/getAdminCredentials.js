#!/usr/bin/env node

// import dependencies
const logAdminCredentials = require('./logAdminCredentials');
const fetchVpnParameters = require('./fetchVpnParameters');
const logs = require('./logs.js')(module);
const db = require('./db');


start();


async function start() {
  // Trigger a parameters load. If parameters are preloaded the execution will be fast
  // Otherwise it will wait for parameter files to exist.
  logs.info('\nLoading VPN parameters... '
    +'It may take a while, press CTRL + C to skip this process \n');
  await fetchVpnParameters();
  logs.info('VPN credentials fetched');

  // Print db censoring privateKey
  const _db = await db.get();
  if (_db && _db.privateKey) {
    _db.privateKey = _db.privateKey.replace(/./g, '*');
  }
  logs.info(JSON.stringify(_db, null, 2 ));

  logAdminCredentials();
}
