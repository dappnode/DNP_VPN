#!/usr/bin/env node

/* eslint-disable no-console */

import cmd from "commander";
import chalk from "chalk";
import {
  addDevice,
  getDeviceCredentials,
  listDevices,
  removeDevice,
  resetDevice,
  toggleAdmin
} from "./calls";
import { generateAndWriteLoginMsg } from "./loginMsg";
import prettyjson from "prettyjson";

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

runVpnCli().catch(err => console.error(chalk.red(err)));

/**
 * Parses a commander instance
 * Returns null or throws an error
 */
async function runVpnCli(): Promise<void> {
  const id = cmd.add || cmd.get || cmd.rm || cmd.toggle || cmd.reset;
  if (cmd.add) {
    await addDevice({ id });
    console.log(chalk.green(`Added device ${id}`));
  } else if (cmd.get) {
    const { url } = await getDeviceCredentials({ id });
    if (cmd.get != adminUser) {
      console.log(chalk.green(`Credentials generated for ${id}: ${url}`));
    } else {
      const loginMsg = await generateAndWriteLoginMsg(url);
      console.log(loginMsg);
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
