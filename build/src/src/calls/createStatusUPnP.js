
function createStatusUPnP(params) {
  return async function statusUPnP() {
    return {
      message: 'UPnP status ',
      result: params.upnpStatus,
    };
  };
}

module.exports = createStatusUPnP;
