#!/usr/bin/env node

import yargs, { CommandBuilder } from "yargs";
import { hideBin } from "yargs/helpers";
import url from "url";
import { styleText } from "util";
import prettyjson from "prettyjson";
import { getRpcCall } from "./api/getRpcCall";
import { API_PORT } from "./params";
import { withHostname } from "./utils/withHostname";

const vpnRpcApiUrl = url.format({
  protocol: "http",
  hostname: "127.0.0.1",
  port: API_PORT,
  pathname: "rpc"
});
// Initialize an RPC client connecting to the VPN RPC server
const api = getRpcCall(vpnRpcApiUrl);

const green = (text: string): string => styleText("green", text);

const idArg: CommandBuilder<object, { id: string }> = yargs =>
  yargs.positional("id", {
    describe: "Device id",
    type: "string",
    demandOption: true
  });

const getArg: CommandBuilder<
  object,
  { id: string; localhost: boolean }
> = yargs =>
  idArg(yargs).option("localhost", {
    describe: "Print URL using localhost instead of the configured hostname",
    type: "boolean",
    default: false
  });

const cli = yargs(hideBin(process.argv));

cli
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
      cli.showHelp();
      console.log("\n");
    }

    console.error(` ✖ ${(err ? err.stack : msg) || "Unknown error"}\n`);
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
    builder: getArg,
    handler: async ({ id, localhost }) => {
      const { url } = await api.getDeviceCredentials({ id });
      const outputUrl = localhost ? withHostname(url, "localhost") : url;
      console.log(green(`Credentials generated for ${id}:\n${outputUrl}`));
    }
  })
  .command({
    command: "print <id>",
    describe: "Print config file to stdout.",
    builder: idArg,
    handler: async ({ id }) => {
      const credFile = await api.getCredFile({ id });
      console.log(credFile);
    }
  })
  .command({
    command: "add <id>",
    describe: "Add device.",
    builder: idArg,
    handler: async ({ id }) => {
      await api.addDevice({ id });
      console.log(green(`Added device ${id}`));
    }
  })
  .command({
    command: "rm <id>",
    describe: "Remove device.",
    builder: idArg,
    handler: async ({ id }) => {
      await api.removeDevice({ id });
      console.log(green(`Removed device ${id}`));
    }
  })
  .command({
    command: "reset <id>",
    describe: "Reset device credentials.",
    builder: idArg,
    handler: async ({ id }) => {
      await api.resetDevice({ id });
      console.log(green(`Reset device ${id}`));
    }
  })
  // Run CLI
  .parse();
