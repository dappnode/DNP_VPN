import { getUserList, removeClient } from "../openvpn";
import { MAIN_ADMIN_NAME } from "../params";

export const REMOVE_MAIN_ADMIN_ERROR = "Cannot remove the main admin user";

/**
 * Removes the device with the provided id, if exists.
 * @param id "new-device"
 */
export async function removeDevice({ id }: { id: string }): Promise<void> {
  const deviceArray = await getUserList();

  if (id === MAIN_ADMIN_NAME) {
    throw Error(REMOVE_MAIN_ADMIN_ERROR);
  }

  if (!deviceArray.includes(id)) {
    throw Error(`Device name not found: ${id}`);
  } else {
    await removeClient(id);
  }
}
