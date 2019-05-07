const getPublicEndpoint = require("./utils/getPublicEndpoint");

/* eslint-disable no-console */

// set silent = true
getPublicEndpoint()
  .then(console.log)
  .catch(() => {
    // Do not log error, because the shell may think it was okay
    process.exit(1);
  });
