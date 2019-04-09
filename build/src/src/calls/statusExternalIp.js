const db = require("../db");

async function statusExternalIp() {
  const _db = await db.get();
  return {
    result: {
      externalIpResolves: _db.externalIpResolves,
      externalIp: _db.externalIp,
      internalIp: _db.internalIp
    }
  };
}

module.exports = statusExternalIp;
