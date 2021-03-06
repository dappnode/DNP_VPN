import { addDevice } from "./addDevice";
import { MAIN_ADMIN_NAME } from "../params";
import { logs } from "../logs";
import { getDeviceCredentials } from "./getDeviceCredentials";
import { VpnDeviceCredentials } from "../types";
import { listDevices } from "./listDevices";

/**
 * Ensures the MASTER_ADMIN device is created
 * Returns a URL browsable from outside the DAppNode network
 * The URL contains necessary credentials (token + encryption key) to retrieve
 * and download an OpenVPN credentials file for the MASTER_ADMIN device
 */
export async function getMasterAdminCred(): Promise<VpnDeviceCredentials> {
  try {
    const devices = await listDevices();
    if (devices.find(d => d.id === MAIN_ADMIN_NAME)) {
      logs.info(`User ${MAIN_ADMIN_NAME} already exists`);
    } else {
      await addDevice({ id: MAIN_ADMIN_NAME });
    }
  } catch (e) {
    if (!e.message.includes("exist"))
      logs.error(`Error creating ${MAIN_ADMIN_NAME} device`, e);
  }

  return await getDeviceCredentials({ id: MAIN_ADMIN_NAME });
}
