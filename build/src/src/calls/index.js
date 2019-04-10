/**
 * Each call on this list will be automatically registered to WAMP
 * The key of the object property will be the call name as
 *     <key>.vpn.dnp.dappnode.eth
 */
module.exports = {
  addDevice: require("./addDevice"),
  getDeviceCredentials: require("./getDeviceCredentials"),
  getParams: require("./getParams"),
  getVersionData: require("./getVersionData"),
  listDevices: require("./listDevices"),
  removeDevice: require("./removeDevice"),
  resetDevice: require("./resetDevice"),
  setStaticIp: require("./setStaticIp"),
  toggleAdmin: require("./toggleAdmin")
};
