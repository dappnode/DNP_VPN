
function createStatusExternalIp(params) {
  return async function statusExternalIp() {
    return {
      message: 'External IP status ',
      result: params.VPN.EXTERNALIP_STATUS,
    };
  };
}

module.exports = createStatusExternalIp;
