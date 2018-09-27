const fs = require('fs');

const upnpStatusPath =
  process.env.DEV ? './test/upnp_status' : process.env.UPNP_STATUS_PATH;

function getUpnpStatus(ip, externalIp, internalIp) {
  // Check availability of UPnP
  const upnpStatus = getStatus(ip, externalIp, internalIp);
  // Write to file
  fs.writeFileSync(
    upnpStatusPath,
    JSON.stringify(upnpStatus),
    'utf8'
  );
  return upnpStatus;
}

const getStatus = (ip, externalIp, internalIp) => {
  if (externalIp && externalIp.length) {
    return ({
      openPorts: true,
      UPnP: true,
      msg: 'UPnP device available',
    });
  }

  else if (
    internalIp && internalIp.length
    && ip && ip.length
    && internalIp === ip
  ) {
    return ({
      openPorts: false,
      UPnP: true,
      msg: 'Cloud service',
    });
  }

  else {
    return ({
      openPorts: true,
      UPnP: false,
      msg: 'UPnP not available. Turn it on or open ports manually',
    });
  }
};

module.exports = getUpnpStatus;
