const res = require('../utils/res')
const exec = require('child_process').exec;

function createGetParams(params) {

  return async function getParams () {

    return res.success('UPnP status ', publicParams(params.VPN))

  }
}

function publicParams(params) {
    // This line DELETES the "PSK" key-value from the params object
    const { PSK, ...publicParams } = params;
    return publicParams
  }

module.exports = createGetParams
