#!/usr/bin/env node

// import dependencies
const createLogAdminCredentials = require('./modules/createLogAdminCredentials');
const credentialsFile = require('./utils/credentialsFile');
const generate = require('./utils/generate');
const fetchVPNparameters = require('./modules/fetchVPNparameters');
const createStatusUPnP = require('./calls/createStatusUPnP');
const createStatusExternalIp = require('./calls/createStatusExternalIp');

// Initialize dependencies
const params = {};
const statusUPnP = createStatusUPnP(params, fetchVPNparameters);
const statusExternalIp = createStatusExternalIp(params, fetchVPNparameters);
const logAdminCredentials = createLogAdminCredentials(
  credentialsFile,
  statusUPnP,
  statusExternalIp,
  generate
);


start();

async function start() {
  // Trigger a parameters load. If parameters are preloaded the execution will be fast
  // Otherwise it will wait for parameter files to exist.

  const VPN = await fetchVPNparameters();
  logAdminCredentials(VPN);
}
