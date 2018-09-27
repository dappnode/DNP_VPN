
function createStatusExternalIp(params) {
  return async function statusExternalIp() {
    return {
      message: 'External IP resolves: '+params.externalIpResolves,
      result: {
        externalIpResolves: params.externalIpResolves,
        externalIp: params.externalIp,
        internalIp: params.internalIp,
      },
    };
  };
}

module.exports = createStatusExternalIp;
