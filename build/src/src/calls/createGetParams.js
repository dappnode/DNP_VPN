

function createGetParams(params) {
  return async function getParams() {
    return {
      message: 'Got params ',
      result: {
        IP: params.ip,
        ip: params.ip,
        NAME: params.name,
        name: params.name,
        server: params.server,
      },
    };
  };
}

module.exports = createGetParams;
