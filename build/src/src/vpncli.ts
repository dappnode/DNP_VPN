#!/usr/bin/env node

import yargs, { CommandBuilder } from "yargs";
import url from "url";
import chalk from "chalk";
import prettyjson from "prettyjson";
import { getRpcCall } from "./api/getRpcCall";
import { API_PORT } from "./params";

/* eslint-disable no-console */

const vpnRpcApiUrl = url.format({
  protocol: "http",
  hostname: "127.0.0.1",
  port: API_PORT,
  pathname: "rpc"
});
// Initialize an RPC client connecting to the VPN RPC server
const api = getRpcCall(vpnRpcApiUrl);

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
  .showHelpOnFail(false)
  .recommendCommands()
  .help()
  .fail((msg, err) => {
    // Show command help message when no command is provided
    if (msg && msg.includes("Not enough non-option arguments")) {
      yargs.showHelp();
      console.log("\n");
    }

    console.error(` ✖ ${err.stack}\n`);
    process.exit(1);
  })

  .command({
    command: "ls",
    describe: "List devices.",
    handler: async () => {
      const devices = await api.listDevices();
      console.log(prettyjson.render(devices));
    }
  })
  .command({
    command: "get <id>",
    describe: "Generate device URL to download config file.",
    builder: idArg,
    handler: async ({ id }) => {
      const { url } = await api.getDeviceCredentials({ id });
      console.log(chalk.green(`Credentials generated for ${id}: ${url}`));
    }
  })
  .command({
    command: "add <id>",
    describe: "Add device.",
    builder: idArg,
    handler: async ({ id }) => {
      await api.addDevice({ id });
      console.log(chalk.green(`Added device ${id}`));
    }
  })
  .command({
    command: "rm <id>",
    describe: "Remove device.",
    builder: idArg,
    handler: async ({ id }) => {
      await api.removeDevice({ id });
      console.log(chalk.green(`Removed device ${id}`));
    }
  })
  .command({
    command: "toggle <id>",
    describe: "Give/remove admin rights to device.",
    builder: idArg,
    handler: async ({ id }) => {
      await api.toggleAdmin({ id });
      console.log(chalk.green(`Toggled admin status of ${id}`));
    }
  })
  .command({
    command: "reset <id>",
    describe: "Reset device credentials.",
    builder: idArg,
    handler: async ({ id }) => {
      await api.resetDevice({ id });
      console.log(chalk.green(`Reset device ${id}`));
    }
  })
  // Run CLI
  .parse();
