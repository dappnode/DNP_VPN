function getUpnpStatus(ip, externalIp, internalIp) {
  // UPnP device available case
  if (externalIp && externalIp.length) {
    return ({
      openPorts: true,
      upnpAvailable: true,
    });
  }

  // Cloud service case
  else if (
    internalIp && internalIp.length
    && ip && ip.length
    && internalIp === ip
  ) {
    return ({
      openPorts: false,
      upnpAvailable: false,
    });
  }

  // UPnP not available. Turn it on or open ports manually
  else {
    return ({
      openPorts: true,
      upnpAvailable: false,
    });
  }
}

module.exports = getUpnpStatus;
