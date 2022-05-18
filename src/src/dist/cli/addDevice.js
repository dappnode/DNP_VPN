"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.account = void 0;
const validator_1 = require("./cmds/validator");
const wallet_1 = require("./cmds/wallet");
exports.account = {
    command: ["account <command>", "am", "a"],
    describe: "Utilities for generating and managing Ethereum 2.0 accounts",
    builder: yargs => yargs.command(validator_1.validator).command(wallet_1.wallet),
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    handler: () => { }
};
//# sourceMappingURL=addDevice.js.map