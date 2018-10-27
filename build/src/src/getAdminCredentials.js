#!/usr/bin/env node

// import dependencies
const loginMsg = require('./loginMsg');
const logs = require('./logs.js')(module);
const pause = require('../utils/pause');

const maxAttempts = 3 * 60; // 3 min
const pauseTime = 1000;

logs.info('\nLoading VPN parameters... '
    +'It may take a while, press CTRL + C to skip this process \n');

// Wait for the loginMsg to exist
loginMsgToExist().then(() => {
  loginMsg.print();
}).catch((e) => {
  logs.error(e.message);
});

async function loginMsgToExist() {
  for (let i = 0; i < maxAttempts; i++) {
    if (loginMsg.exists()) return;
    await pause(pauseTime);
  }
  throw Error(`loginMsg file not found at ${loginMsg.path} (after #${maxAttempts} attempts)`);
}
