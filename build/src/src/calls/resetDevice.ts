import { buildClient, removeClient } from "../openvpn";

/**
 * Regenerates the credentials of the specified device.
 * @param id "new-device"
 */
export async function resetDevice({ id }: { id: string }): Promise<void> {
  if (id === "") {
    throw Error("The device name cannot be empty");
  }

  await removeClient(id);
  await buildClient(id);
}
