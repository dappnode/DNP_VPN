#!/usr/bin/env node

const cmd = require('commander');
const chalk = require('chalk');
const addDevice = require('./calls/addDevice');
const getDeviceCredentials = require('./calls/getDeviceCredentials');
const listDevices = require('./calls/listDevices');
const removeDevice = require('./calls/removeDevice');
const toggleAdmin = require('./calls/toggleAdmin');
const prettyjson = require('prettyjson');

cmd.option('ls', 'List devices.')
    .option('get <id>', 'Generate device URL to download config file.')
    .option('add <id>', 'Add device.')
    .option('rm <id>', 'Remove device.')
    .option('toggle <id>', 'Give/remove admin rights to device.')
    .parse(process.argv);

if (process.argv.length === 2) {
    console.log('Usage: ' + chalk.yellow('vpntool [option]'));
    console.log('       ' + chalk.yellow('vpntool --help') + '\t to view available options\n');
    process.exit(1);
}
if (cmd.add) {
    addDevice({id: cmd.add}).then((res) => {
        if (res.message) {
            console.log(chalk.green(res.message));
        }
    },
    (err) => {
        console.log(chalk.red(err));
    });
}
else if (cmd.get) {
    getDeviceCredentials({id: cmd.get}).then((res) => {
        if (res.result) {
            console.log(chalk.green(`Credentials generated for ${cmd.get}: ${res.result.url}`));
        } else {
            console.log(chalk.red(`Failed: ${res.message}`));
        }
    },
    (err) => {
        console.log(chalk.red(err))
    });
}
else if (cmd.ls) {
    listDevices().then((res) => {
        if (res.result) {
            console.log(chalk.green(prettyjson.render(res.result)));
        }
    },
    (err) => {
        console.log(chalk.red(err));
    });
}
else if (cmd.rm) {
    removeDevice({id: cmd.rm}).then((res) => {
        if (res.message) {
            console.log(chalk.green(res.message));
        }
    },
    (err) => {
        console.log(chalk.red(err));
    });
}
else if (cmd.toggle) {
    toggleAdmin({id: cmd.toggle}).then((res) => {
        if (res.message) {
            console.log(chalk.green(res.message));
        }
    },
    (err) => {
        console.log(chalk.red(err));
    });
}
else {
    console.log(chalk.yellow('Command unknown!'));
}
