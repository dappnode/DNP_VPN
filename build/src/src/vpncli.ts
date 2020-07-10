#!/usr/bin/env node

import url from "url";
import cmd from "commander";
import chalk from "chalk";
import prettyjson from "prettyjson";
import { getRpcCall } from "./api/getRpcCall";
import { API_PORT } from "./params";

/* eslint-disable no-console */

cmd
  .option("ls", "List devices.")
  .option("get <id>", "Generate device URL to download config file.")
  .option("add <id>", "Add device.")
  .option("rm <id>", "Remove device.")
  .option("toggle <id>", "Give/remove admin rights to device.")
  .option("reset <id>", "Reset device credentials.")
  .parse(process.argv);

if (process.argv.length <= 2) {
  console.log(`Usage: ${chalk.yellow("vpncli [option]")}
       ${chalk.yellow("vpncli --help")}\t to view available options\n`);
  process.exit(1);
}

/**
 * Parses a commander instance
 * Returns null or throws an error
 */
(async function(): Promise<void> {
  try {
    const vpnRpcApiUrl = url.format({
      protocol: "http",
      hostname: "127.0.0.1",
      port: API_PORT,
      pathname: "rpc"
    });
    // Initialize an RPC client connecting to the VPN RPC server
    const api = getRpcCall(vpnRpcApiUrl);

    const id = cmd.add || cmd.get || cmd.rm || cmd.toggle || cmd.reset;

    if (cmd.add) {
      await api.addDevice({ id });
      console.log(chalk.green(`Added device ${id}`));
    } else if (cmd.get) {
      const { url } = await api.getDeviceCredentials({ id });
      console.log(chalk.green(`Credentials generated for ${id}: ${url}`));
    } else if (cmd.ls) {
      const devices = await api.listDevices();
      console.log(prettyjson.render(devices));
    } else if (cmd.rm) {
      await api.removeDevice({ id });
      console.log(chalk.green(`Removed device ${id}`));
    } else if (cmd.toggle) {
      await api.toggleAdmin({ id });
      console.log(chalk.green(`Toggled admin status of ${id}`));
    } else if (cmd.reset) {
      await api.resetDevice({ id });
      console.log(chalk.green(`Reset device ${id}`));
    } else {
      console.log(chalk.yellow("Command unknown!"));
    }
  } catch (e) {
    console.error(chalk.red(e));
    process.exit(1);
  }
})();
