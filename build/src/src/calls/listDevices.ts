import { getUserList } from "../openvpn";
import { VpnDevice } from "../types";

/**
 * Returns a list of the existing devices, with the admin property
 */
export async function listDevices(): Promise<VpnDevice[]> {
  const userList = await getUserList();

  return userList.map(user => ({
    id: user
  }));
}
