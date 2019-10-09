/**
 * Each call on this list will be automatically registered to WAMP
 * The key of the object property will be the call name as
 *     <key>.vpn.dnp.dappnode.eth
 */
module.exports = {
  addDevice: require("./addDevice"),
  getDeviceCredentials: require("./getDeviceCredentials"),
  getVersionData: require("./getVersionData"),
  listDevices: require("./listDevices"),
  removeDevice: require("./removeDevice"),
  resetDevice: require("./resetDevice"),
  toggleAdmin: require("./toggleAdmin")
};