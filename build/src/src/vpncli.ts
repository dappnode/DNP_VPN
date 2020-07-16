#!/usr/bin/env node

import yargs, { CommandBuilder } from "yargs";
import chalk from "chalk";
import prettyjson from "prettyjson";
import { getVpnRpcApiClient } from "./api/getRpcCall";

/* eslint-disable no-console */

// Initialize an RPC client connecting to the VPN RPC server
const api = getVpnRpcApiClient();

const idArg: CommandBuilder<{}, { id: string }> = yargs =>
  yargs.positional("id", {
    describe: "Device id",
    type: "string",
    demandOption: true
  });

yargs
  .usage(`Usage: vpncli <command> [options]`)
  .alias("h", "help")
  .alias("v", "version")
  // blank scriptName so that help text doesn't display the cli name before each command
  .scriptName("")
  .demandCommand(1)
  .command({
    command: "ls",
    describe: "List devices.",
    handler: async () => {
      const devices = await api.listDevices();
      console.log(prettyjson.render(devices));
    }
  })
  .command({
    command: "get",
    describe: "Generate device URL to download config file.",
    builder: idArg,
    handler: async ({ id }) => {
      const { url } = await api.getDeviceCredentials({ id });
      console.log(chalk.green(`Credentials generated for ${id}: ${url}`));
    }
  })
  .command({
    command: "add",
    describe: "Add device.",
    builder: idArg,
    handler: async ({ id }) => {
      await api.addDevice({ id });
      console.log(chalk.green(`Added device ${id}`));
    }
  })
  .command({
    command: "rm",
    describe: "Remove device.",
    builder: idArg,
    handler: async ({ id }) => {
      await api.removeDevice({ id });
      console.log(chalk.green(`Removed device ${id}`));
    }
  })
  .command({
    command: "toggle",
    describe: "Give/remove admin rights to device.",
    builder: idArg,
    handler: async ({ id }) => {
      await api.toggleAdmin({ id });
      console.log(chalk.green(`Toggled admin status of ${id}`));
    }
  })
  .command({
    command: "reset",
    describe: "Reset device credentials.",
    builder: idArg,
    handler: async ({ id }) => {
      await api.resetDevice({ id });
      console.log(chalk.green(`Reset device ${id}`));
    }
  })
  // Run CLI
  .parse();
