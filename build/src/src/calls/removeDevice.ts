import { getUserList, getCCD, removeClient } from "../openvpn";
import { MAIN_ADMIN_NAME } from "../params";

/**
 * Removes the device with the provided id, if exists.
 * @param id "new-device"
 */
export async function removeDevice({ id }: { id: string }): Promise<void> {
  const deviceArray = await getUserList();
  const ccdArray = getCCD();

  if (ccdArray.find(c => c.cn === id))
    throw Error("You cannot remove an admin user");

  if (id === MAIN_ADMIN_NAME) {
    throw Error("Cannot remove the main admin user");
  }

  if (!deviceArray.includes(id)) {
    throw Error(`Device name not found: ${id}`);
  } else {
    await removeClient(id);
  }
}
