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

runVpnCli(cmd).catch(err => console.error(chalk.red(err)));

/**
 * Parses a commander instance
 * Returns null or throws an error
 */
async function runVpnCli(cmd) {
  const id = cmd.add || cmd.get || cmd.rm || cmd.toggle || cmd.reset;
  if (cmd.add) {
    await addDevice({ id });
    console.log(chalk.green(`Added device ${id}`));
  } else if (cmd.get) {
    const { url } = await getDeviceCredentials({ id });
    if (cmd.get != adminUser) {
      console.log(chalk.green(`Credentials generated for ${id}: ${url}`));
    } else {
      loginMsg.write(url).then(console.log);
    }
  } else if (cmd.ls) {
    const devices = await listDevices();
    console.log(prettyjson.render(devices));
  } else if (cmd.rm) {
    await removeDevice({ id });
    console.log(chalk.green(`Removed device ${id}`));
  } else if (cmd.toggle) {
    await toggleAdmin({ id });
    console.log(chalk.green(`Toggled admin status of ${id}`));
  } else if (cmd.reset) {
    await resetDevice({ id });
    console.log(chalk.green(`Reset device ${id}`));
  } else {
    console.log(chalk.yellow("Command unknown!"));
  }
}
