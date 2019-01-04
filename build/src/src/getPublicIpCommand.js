const getPublicIp = require('./utils/getPublicIp');

/* eslint-disable no-console */

// set silent = true
getPublicIp(true)
    .then(console.log)
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
