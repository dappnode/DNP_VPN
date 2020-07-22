import { VpnDeviceCredentials, VpnDevice, VpnStatus } from "../types";

export interface Routes {
  /**
   * Creates a new device with the provided id.
   * Generates certificates and keys needed for OpenVPN.
   * @param id Device id name
   */
  addDevice: (kwargs: { id: string }) => Promise<void>;

  /**
   * Creates a new OpenVPN credentials file, encrypted.
   * The filename is the (16 chars short) result of hashing the generated salt in the db,
   * concatenated with the device id.
   * @param id Device id name
   */
  getDeviceCredentials: (kwargs: {
    id: string;
  }) => Promise<VpnDeviceCredentials>;

  /**
   * Returns the current status of the VPN server
   */
  getStatus: () => Promise<VpnStatus>;

  /**
   * Removes the device with the provided id, if exists.
   * @param id Device id name
   */
  removeDevice: (kwargs: { id: string }) => Promise<void>;

  /**
   * Resets the device credentials with the provided id, if exists.
   * @param id Device id name
   */
  resetDevice: (kwargs: { id: string }) => Promise<void>;

  /**
   * Gives/removes admin rights to the provided device id.
   * @param id Device id name
   */
  toggleAdmin: (kwargs: { id: string }) => Promise<void>;

  /**
   * Returns a list of the existing devices, with the admin property
   */
  listDevices: () => Promise<VpnDevice[]>;
}

export const routesData: { [P in keyof Routes]: {} } = {
  addDevice: {},
  getDeviceCredentials: {},
  getStatus: {},
  removeDevice: {},
  resetDevice: {},
  toggleAdmin: {},
  listDevices: {}
};

// DO NOT REMOVE
// Enforces that each route is a function that returns a promise
export type RoutesArguments = { [K in keyof Routes]: Parameters<Routes[K]> };
export type RoutesReturn = {
  [K in keyof Routes]: ReplaceVoidWithNull<ResolvedType<Routes[K]>>;
};

/**
 * Returns the return resolved type of a function type
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export type ResolvedType<T extends (...args: any) => Promise<any>> = T extends (
  ...args: any
) => Promise<infer R>
  ? R
  : never;
/* eslint-disable @typescript-eslint/no-explicit-any */

export type ReplaceVoidWithNull<T> = T extends void ? null : T;
