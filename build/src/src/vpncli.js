#!/usr/bin/env node

/* eslint-disable no-console */

const cmd = require("commander");
const chalk = require("chalk");
const addDevice = require("./calls/addDevice");
const getDeviceCredentials = require("./calls/getDeviceCredentials");
const listDevices = require("./calls/listDevices");
const removeDevice = require("./calls/removeDevice");
const resetDevice = require("./calls/resetDevice");
const toggleAdmin = require("./calls/toggleAdmin");
const loginMsg = require("./loginMsg");
const prettyjson = require("prettyjson");

const adminUser = process.env.DEFAULT_ADMIN_USER
  ? process.env.DEFAULT_ADMIN_USER
  : "dappnode_admin";

cmd
  .option("ls", "List devices.")
  .option("get <id>", "Generate device URL to download config file.")
  .option("add <id>", "Add device.")
  .option("rm <id>", "Remove device.")
  .option("toggle <id>", "Give/remove admin rights to device.")
  .option("reset <id>", "Reset device credentials.")
  .parse(process.argv);

if (process.argv.length === 2) {
  console.log(`Usage: ${chalk.yellow("vpntool [option]")}`);
  console.log(
    `       ${chalk.yellow("vpntool --help")}\t to view available options\n`
  );
  process.exit(1);
}
if (cmd.add) {
  addDevice({ id: cmd.add }).then(res => {
    if (res.message) {
      console.log(chalk.green(res.message));
    }
  }, printError);
} else if (cmd.get) {
  getDeviceCredentials({ id: cmd.get }).then(res => {
    if (res.result) {
      if (cmd.get != adminUser) {
        console.log(
          chalk.green(`Credentials generated for ${cmd.get}: ${res.result.url}`)
        );
      } else {
        loginMsg.write(res.result.url).then(console.log);
      }
    } else {
      console.log(chalk.red(`Failed: ${res.message}`));
    }
  }, printError);
} else if (cmd.ls) {
  listDevices().then(res => {
    if (res.result) {
      console.log(chalk.green(prettyjson.render(res.result)));
    }
  }, printError);
} else if (cmd.rm) {
  removeDevice({ id: cmd.rm }).then(res => {
    if (res.message) {
      console.log(chalk.green(res.message));
    }
  }, printError);
} else if (cmd.toggle) {
  toggleAdmin({ id: cmd.toggle }).then(res => {
    if (res.message) {
      console.log(chalk.green(res.message));
    }
  }, printError);
} else if (cmd.reset) {
  resetDevice({ id: cmd.reset }).then(res => {
    if (res.message) {
      console.log(chalk.green(res.message));
    }
  }, printError);
} else {
  console.log(chalk.yellow("Command unknown!"));
}

function printError(err) {
  console.log(chalk.red(err));
}
