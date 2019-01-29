#!/usr/bin/env node

/* eslint-disable no-console */ /* eslint-disable max-len */
// This module must NOT have any non-native dependencies
const fs = require('fs');

const loginMsgPath = process.env.LOGIN_MSG_PATH || './loginMsgFile.txt';

const maxAttempts = 3 * 60; // 3 min
const pauseTime = 1000;

console.log('\nLoading VPN parameters... '
    +'It may take a while, press CTRL + C to skip this process \n');

// Wait for the loginMsg to exist
let count = 0;
fs.readFile(loginMsgPath, 'utf8', (err, loginMsgData) => {
    if (err) {
        if (err.code !== 'ENOENT') console.error(`Error reading loginMsgFile ${err.message}`);
        if (count++ > maxAttempts) console.error(`loginMsgFile missing after ${maxAttempts} attempts`);
        else setTimeout(check, pauseTime);
    } else {
        console.log(loginMsgData);
    }
});