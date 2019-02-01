const getPublicEndpoint = require('./utils/getPublicEndpoint');

/* eslint-disable no-console */

// set silent = true
getPublicEndpoint()
    .then(console.log)
    .catch((e) => {
        // console.log(e);
        process.exit(1);
    });
