/**
 * Each call on this list will be automatically registered to WAMP
 * The key of the object property will be the call name as
 *     <key>.vpn.dnp.dappnode.eth
 */
export * from "./addDevice";
export * from "./getDeviceCredentials";
export * from "./getVersionData";
export * from "./listDevices";
export * from "./removeDevice";
export * from "./resetDevice";
export * from "./toggleAdmin";
