#!/usr/bin/env node

// import dependencies
const logAdminCredentials = require('./logAdminCredentials');
const fetchVpnParameters = require('./fetchVpnParameters');
const logs = require('./logs.js')(module);


start();


async function start() {
  // Trigger a parameters load. If parameters are preloaded the execution will be fast
  // Otherwise it will wait for parameter files to exist.
  logs.info('\nLoading VPN parameters... '
    +'It may take a while, press CTRL + C to skip this process \n');
  await fetchVpnParameters();
  logs.info('VPN credentials fetched');
  logAdminCredentials();
}
