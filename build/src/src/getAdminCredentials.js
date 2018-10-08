#!/usr/bin/env node

// import dependencies
const createLogAdminCredentials = require('./createLogAdminCredentials');
const credentialsFile = require('./utils/credentialsFile');
const generate = require('./utils/generate');
const fetchVpnParameters = require('./fetchVpnParameters');
const logs = require('./logs.js')(module);

// Initialize dependencies
const logAdminCredentials = createLogAdminCredentials(
  credentialsFile,
  generate
);


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
