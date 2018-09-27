
function createStatusUPnP(params) {
  return async function statusUPnP() {
    return {
      message: 'UPnP status ',
      result: {
        openPorts: params.openPorts,
        upnpAvailable: params.upnpAvailable,
      },
    };
  };
}

module.exports = createStatusUPnP;
