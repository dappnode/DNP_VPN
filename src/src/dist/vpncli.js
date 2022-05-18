#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yargs_1 = __importDefault(require("yargs"));
const url_1 = __importDefault(require("url"));
const chalk_1 = __importDefault(require("chalk"));
const prettyjson_1 = __importDefault(require("prettyjson"));
const getRpcCall_1 = require("./api/getRpcCall");
const params_1 = require("./params");
/* eslint-disable no-console */
const vpnRpcApiUrl = url_1.default.format({
    protocol: "http",
    hostname: "127.0.0.1",
    port: params_1.API_PORT,
    pathname: "rpc"
});
// Initialize an RPC client connecting to the VPN RPC server
const api = getRpcCall_1.getRpcCall(vpnRpcApiUrl);
const idArg = yargs => yargs.positional("id", {
    describe: "Device id",
    type: "string",
    demandOption: true
});
yargs_1.default
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
        yargs_1.default.showHelp();
        console.log("\n");
    }
    console.error(` ✖ ${(err ? err.stack : msg) || "Unknown error"}\n`);
    process.exit(1);
})
    .command({
    command: "ls",
    describe: "List devices.",
    handler: () => __awaiter(void 0, void 0, void 0, function* () {
        const devices = yield api.listDevices();
        console.log(prettyjson_1.default.render(devices));
    })
})
    .command({
    command: "get <id>",
    describe: "Generate device URL to download config file.",
    builder: idArg,
    handler: ({ id }) => __awaiter(void 0, void 0, void 0, function* () {
        const { url } = yield api.getDeviceCredentials({ id });
        console.log(chalk_1.default.green(`Credentials generated for ${id}:\n${url}`));
    })
})
    .command({
    command: "print <id>",
    describe: "Print config file to stdout.",
    builder: idArg,
    handler: ({ id }) => __awaiter(void 0, void 0, void 0, function* () {
        const credFile = yield api.getCredFile({ id });
        console.log(credFile);
    })
})
    .command({
    command: "add <id>",
    describe: "Add device.",
    builder: idArg,
    handler: ({ id }) => __awaiter(void 0, void 0, void 0, function* () {
        yield api.addDevice({ id });
        console.log(chalk_1.default.green(`Added device ${id}`));
    })
})
    .command({
    command: "rm <id>",
    describe: "Remove device.",
    builder: idArg,
    handler: ({ id }) => __awaiter(void 0, void 0, void 0, function* () {
        yield api.removeDevice({ id });
        console.log(chalk_1.default.green(`Removed device ${id}`));
    })
})
    .command({
    command: "reset <id>",
    describe: "Reset device credentials.",
    builder: idArg,
    handler: ({ id }) => __awaiter(void 0, void 0, void 0, function* () {
        yield api.resetDevice({ id });
        console.log(chalk_1.default.green(`Reset device ${id}`));
    })
})
    // Run CLI
    .parse();
//# sourceMappingURL=vpncli.js.map