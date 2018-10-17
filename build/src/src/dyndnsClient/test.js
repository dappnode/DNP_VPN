const updateIp = require('./updateIp');

/* eslint-disable */

/**
 * Some env variables are needed to run the test
 *
ENV DYNDNS_HOST https://ns.dappnode.io
ENV PUBLIC_IP_URL https://ns.dappnode.io/myip
ENV KEYPAIR_PATH /opt/app/secrets/keypair


KEYPAIR_PATH=./mockFiles/keypair DYNDNS_HOST=https://ns.dappnode.io PUBLIC_IP_URL=https://ns.dappnode.io/myip node src/dyndnsClient/test.js

 */

updateIp();

