#!/usr/bin/env node

/* eslint-disable no-console */ /* eslint-disable max-len */
// This module must NOT have any non-native dependencies
const fs = require('fs');

const loginMsgPath = process.env.LOGIN_MSG_PATH || './loginMsgFile.txt';

const maxSeconds = 3 * 60; // 3 min
const pauseTime = 1000;

console.log(`
Loading VPN parameters...
It may take a while, press CTRL + C to skip this process
`);

// Wait for the loginMsg to exist.
// This is created at index.js line ~116
// serves as flag to signal the end of the initialization
check();

let count = 0;
function check() {
  fs.readFile(loginMsgPath, 'utf8', (err, loginMsg) => {
    if (err) {
      if (err.code !== 'ENOENT') console.error(`Error reading loginMsgFile ${err.message}`);
      if (count++ > maxSeconds) console.error(`loginMsgFile missing after ${maxSeconds} seconds`);
      else setTimeout(check, pauseTime);
    } else {
      console.log(loginMsg);
    }
  });
}
