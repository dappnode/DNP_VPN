#!/usr/bin/env node

const getDeviceCredentials = require('./calls/getDeviceCredentials');

/* eslint-disable no-console */

async function main() {
    console.log(process.argv[0]);
    if (process.argv.length < 3) {
        console.log('Usage: geturl <user>');
        process.exit(0);
    }
    const creds = await getDeviceCredentials.generate({id: process.argv[1]});
    console.log(creds);
}

main();
