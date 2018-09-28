#!/usr/bin/env node

// import dependencies
const createLogAdminCredentials = require('./createLogAdminCredentials');
const credentialsFile = require('./utils/credentialsFile');
const generate = require('./utils/generate');
const fetchVpnParameters = require('./fetchVpnParameters');
const dyndnsClient = require('./dyndnsClient');
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
  /* eslint-disable no-console */
  console.log('\nLoading VPN parameters... '
    +'It may take a while, press CTRL + C to skip this process \n');
  /* eslint-enable no-console */
  const params = await fetchVpnParameters();
  params.server = (await dyndnsClient.getKeys() || {}).domain || params.IP;
  logs.info('VPN credentials fetched - \n  '
  + Object.keys(params).map((n) => n+': '+params[n]).join('\n  '));
  logAdminCredentials(params);
}
