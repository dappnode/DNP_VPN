
function createStatusExternalIp(params) {
  return async function statusExternalIp() {
    return {
      message: 'External IP status ',
      result: params.externalIpStaus,
    };
  };
}

module.exports = createStatusExternalIp;
