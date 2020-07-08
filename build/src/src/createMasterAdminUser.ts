import { addDevice, getDeviceCredentials, listDevices } from "./calls";
import { grantAdmin } from "./openvpn";
import { MASTER_ADMIN_NAME } from "./params";
import { generateAndWriteLoginMsg } from "./loginMsg";

export async function createMasterAdminUser() {
  const devices = await listDevices();
  if (!devices.some(device => device.id === MASTER_ADMIN_NAME)) {
    // Create admin user
    await addDevice({ id: MASTER_ADMIN_NAME });
    grantAdmin(MASTER_ADMIN_NAME);

    // Print login message for user to connect
    const { url } = await getDeviceCredentials({ id: MASTER_ADMIN_NAME });
    const loginMsg = await generateAndWriteLoginMsg(url);
    console.log(loginMsg);
  }
}
