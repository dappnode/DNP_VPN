import { getCCD, getUserList, revokeAdmin, grantAdmin } from "../openvpn";
import { MASTER_ADMIN_NAME } from "../params";

/**
 * Gives/removes admin rights to the provided device id.
 * @param id "new-device"
 */
export async function toggleAdmin({ id }: { id: string }): Promise<void> {
  const devices = await getUserList();
  if (!devices.includes(id)) {
    throw Error(`Device not found: ${id}`);
  }

  const ccdArray = getCCD();
  const isAdmin = ccdArray.find(c => c.cn === id);

  if (isAdmin) {
    if (id === MASTER_ADMIN_NAME) {
      throw Error("Cannot remove the master admin user");
    }
    revokeAdmin(id);
  } else {
    grantAdmin(id);
  }
}
