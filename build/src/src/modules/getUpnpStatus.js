const fs = require('fs');

const UPNP_STATUS_FILE_PATH =
  process.env.DEV ? './test/upnp_status' : process.env.UPNP_STATUS_FILE_PATH;

async function getUpnpStatus(IP, EXT_IP, INT_IP) {
  // Check availability of UPnP
  const upnpStatus = getStatus(IP, EXT_IP, INT_IP);
  // Write to file
  fs.writeFileSync(
    UPNP_STATUS_FILE_PATH,
    JSON.stringify(upnpStatus),
    'utf8'
);
}

const getStatus = (IP, EXT_IP, INT_IP) => {
  if (EXT_IP && EXT_IP.length) {
    return ({
      openPorts: true,
      UPnP: true,
      msg: 'UPnP device available',
    });
  }

  else if (
    INT_IP && INT_IP.length
    && IP && IP.length
    && INT_IP === IP
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
