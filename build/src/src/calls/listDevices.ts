import { getUserList } from "../utils/getUserList";
import { getCCD } from "../utils/getCCD";
import { VpnDevice } from "../types";

/**
 * Returns a list of the existing devices, with the admin property
 */
export async function listDevices(): Promise<VpnDevice[]> {
  const userList = await getUserList();
  const ccd = getCCD();

  return userList.map(user => ({
    id: user,
    admin: ccd.some(obj => obj.cn === user),
    ip: ""
  }));
}
