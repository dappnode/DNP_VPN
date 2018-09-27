#!/usr/bin/env node

// import dependencies
const createLogAdminCredentials = require('./modules/createLogAdminCredentials');
const credentialsFile = require('./utils/credentialsFile');
const generate = require('./utils/generate');
const fetchVPNparameters = require('./modules/fetchVPNparameters');

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
  const params = await fetchVPNparameters();
  logAdminCredentials(params);
}
