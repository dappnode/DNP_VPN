const res = require('../utils/res');

function createGetParams(params) {
  return async function getParams() {
    return res.success('UPnP status ', publicParams(params.VPN));
  };
}

function publicParams(params) {
    // This line DELETES the "PSK" key-value from the params object
    let publicParams = Object.assign({}, params);
    delete publicParams.PSK;
    return publicParams;
  }

module.exports = createGetParams;
