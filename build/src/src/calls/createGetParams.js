

function createGetParams(params) {
  return async function getParams() {
    return {
      message: 'UPnP status '+JSON.stringify(publicParams(params.VPN)),
      result: publicParams(params.VPN),
    };
  };
}

function publicParams(params) {
    // This line DELETES the "PSK" key-value from the params object
    let publicParams = Object.assign({}, params);
    delete publicParams.PSK;
    return publicParams;
  }

module.exports = createGetParams;
