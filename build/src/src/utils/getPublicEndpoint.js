const getPublicIpFromUrls = require("./getPublicIpFromUrls");
const db = require("../db");

/**
 * Returns the VPN endpoint, can be a domain or an IP.
 * It will be the static IP or dyndns domain, or the public IP if the latter fails
 * > Must not output any logs, so the function can be used by commands
 */

async function getPublicEndpoint() {
  // Return static IP or domain
  return (
    (await db.get("staticIp")) ||
    (await db.get("domain")) ||
    // Default to consult urls. This case will barely never happen
    (await getPublicIpFromUrls({ silent: true }))
  );
}

module.exports = getPublicEndpoint;
