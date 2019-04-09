const db = require("../db");

async function statusUPnP() {
  const _db = await db.get();
  return {
    result: {
      openPorts: _db.openPorts,
      upnpAvailable: _db.name
    }
  };
}

module.exports = statusUPnP;
