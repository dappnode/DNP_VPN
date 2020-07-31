import { getUserList, getCCD } from "../openvpn";
import { VpnDevice, OpenVpnCCDItem } from "../types";

/**
 * Returns a list of the existing devices, with the admin property
 */
export async function listDevices(): Promise<VpnDevice[]> {
  const userList = await getUserList();
  const ccd = getCCD();

  const ccdById = ccd.reduce(
    (byId, device) => {
      return { ...byId, [device.cn]: device };
    },
    {} as { [id: string]: OpenVpnCCDItem }
  );

  return userList.map(user => ({
    id: user,
    admin: Boolean(ccdById[user]),
    ip: (ccdById[user] || {}).ip || ""
  }));
}
