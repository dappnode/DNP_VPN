#!/usr/bin/env node

// import dependencies
const createLogAdminCredentials = require('./modules/createLogAdminCredentials');
const credentialsFile = require('./utils/credentialsFile');
const generate = require('./utils/generate');
const fetchVPNparameters = require('./modules/fetchVPNparameters');

// Initialize dependencies
const logAdminCredentials = createLogAdminCredentials(credentialsFile, generate);

start();

async function start() {
  const VPN = await fetchVPNparameters();
  logAdminCredentials(VPN);
}
