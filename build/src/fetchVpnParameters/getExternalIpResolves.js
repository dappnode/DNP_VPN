const logs = require('../logs.js')(module);

function getExternalIpResolves(ip, internalIp, publicIpResolved) {
  // Case 1: Cloud service
  if (!ip === '' && ip === internalIp) {
    return true;
  }

  // Case 2: Normal case, test if public ip (external) resolves
  if (publicIpResolved == '0') {
    return false;
  } else if (publicIpResolved == '1') {
    return true;
  } else {
    logs.warn('PUBLIC_IP_RESOLVED has a wrong format: '+publicIpResolved);
    return false;
  }
}


module.exports = getExternalIpResolves;
