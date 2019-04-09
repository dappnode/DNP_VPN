#!/usr/bin/env node
const fs = require("fs");

/* eslint-disable no-console */

// This module must NOT have any non-native dependencies

const loginMsgPath = process.env.LOGIN_MSG_PATH || "./loginMsgFile.txt";

const maxAttempts = 3 * 60; // 3 min
const pauseTime = 1000;

console.log(`
  Loading VPN parameters... It may take a while, press CTRL + C to skip this process
`);

// Wait for the loginMsg to exist
check();
function check() {
  let count = 0;
  fs.readFile(loginMsgPath, "utf8", (err, loginMsg) => {
    if (err) {
      if (err.code !== "ENOENT")
        console.error(`Error reading loginMsgFile ${err.message}`);
      if (count++ > maxAttempts)
        console.error(`loginMsgFile missing after ${maxAttempts} attempts`);
      else setTimeout(check, pauseTime);
    } else {
      console.log(loginMsg);
    }
  });
}
