/**
 * Each call on this list will be automatically registered to WAMP
 * The key of the object property will be the call name as
 *     <key>.vpn.dnp.dappnode.eth
 */
module.exports = {
    addDevice: require('./addDevice'),
    getDeviceCredentials: require('./getDeviceCredentials'),
    removeDevice: require('./removeDevice'),
    toggleAdmin: require('./toggleAdmin'),
    listDevices: require('./listDevices'),
    getParams: require('./getParams'),
    setStaticIp: require('./setStaticIp'),
    statusExternalIp: require('./statusExternalIp'),
    statusUPnP: require('./statusUPnP'),
};
