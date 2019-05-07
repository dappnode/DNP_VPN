const db = require("./db");
const logs = require("./logs.js")(module);
const crypto = require("crypto");
// Modules
const dyndnsClient = require("./dyndnsClient");
// Utils
const getServerName = require("./utils/getServerName");
const getInternalIp = require("./utils/getInternalIp");
const getStaticIp = require("./utils/getStaticIp");
const getExternalUpnpIp = require("./utils/getExternalUpnpIp");
const getPublicIpFromUrls = require("./utils/getPublicIpFromUrls");
const ping = require("./utils/ping");
const pause = require("./utils/pause");

initializeApp();

async function initializeApp() {
  // 1. Directly connected to the internet: Public IP is the interface IP
  // 2. Behind a router: Needs to get the public IP, open ports and get the internal IP
  // 2A. UPnP available: Get public IP without a centralize service. Can open ports
  // 2B. No UPnP: Open ports manually, needs a centralized service to get the public IP
  // 2C. No NAT-Loopback: Public IP can't be resolved within the same network. User needs 2 profiles

  // Check if the static IP is set. If so, don't use any centralized IP-related service
  // The publicIp will be obtained in the entrypoint.sh and exported as PUBLIC_IP
  const staticIp = await getStaticIp();
  let internalIp;
  while (!internalIp) {
    internalIp = await getInternalIp();
    if (!internalIp) {
      logs.warn("Internal IP is not available yet, retrying in 60 seconds");
      await pause(60 * 1000);
    }
  }
  // > External IP
  //   If the host is exposed to the internet and the staticIp is set, avoid calling UPnP.
  //   Otherwise, get the externalIp from UPnP
  //   *
  const externalIp =
    staticIp && staticIp === internalIp ? staticIp : await getExternalUpnpIp();
  // > Public IP
  //   `getPublicIpFromUrls` is a call to a centralized service.
  //   If the staticIp or the externalIp (from UPnP) is set, avoid calling getPublicIpFromUrls
  const publicIp = staticIp || externalIp || (await getPublicIpFromUrls());
  // > UPnP Available
  //   This boolean will trigger the VPN nodejs process to try to open the ports with UPnP
  //   UPnP is available and necessary only if the internalIp is not equal to the public IP
  //   and the external IP from UPnP command succeeded
  const upnpAvailable = Boolean(internalIp !== publicIp && externalIp);
  // > No NAT Loopback
  //   This boolean will trigger a warning in the ADMIN UI to alert the user to use different VPN profiles
  //   If the DAppNode is not able to resolve it's own public IP, the user should use the internal IP
  //   to connect from the same network as the DAppNode
  //   *The ping command is really slow, only execute it if necessary
  const noNatLoopback = Boolean(
    internalIp !== publicIp ? !(await ping(publicIp)) : false
  );
  // > Alert user to open ports
  //   This boolean will trigger a warning in the ADMIN UI to alert the user to open ports
  //   Will be true if the DAppNode is behind a router but the external IP from UPnP command failed
  const alertUserToOpenPorts = Boolean(
    internalIp !== publicIp && !upnpAvailable
  );

  await db.set("ip", publicIp);
  await db.set("psk", process.env.PSK);
  await db.set("name", await getServerName());
  await db.set("upnpAvailable", upnpAvailable);
  await db.set("noNatLoopback", noNatLoopback);
  await db.set("alertToOpenPorts", alertUserToOpenPorts);
  await db.set("internalIp", internalIp);

  // Create VPN's address + publicKey + privateKey if it doesn't exist yet (with static ip or not)
  // - Verify if the privateKey is corrupted or lost. Then create a new identity and alert the user
  // - Updates the domain: db.set('domain', domain)
  await dyndnsClient.generateKeys();

  // Generate salt
  if (await db.get("salt")) {
    logs.info("Salt is already generated, skipping its generation");
  } else {
    const salt = crypto.randomBytes(8).toString("hex");
    await db.set("salt", salt);
    logs.info(`Successfully generated salt of 8 bytes: ${salt}`);
  }
}
