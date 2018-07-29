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

  const VPN = await fetchVPNparameters();
  logAdminCredentials(VPN);
}
