
function createStatusUPnP(params) {
  return async function statusUPnP() {
    return {
      message: 'UPnP status ',
      result: params.VPN.UPNP_STATUS,
    };
  };
}

module.exports = createStatusUPnP;
