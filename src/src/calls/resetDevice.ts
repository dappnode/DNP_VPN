import { assertDeviceExists, buildClient, removeClient } from "../openvpn";

/**
 * Regenerates the credentials of the specified device.
 * @param id "new-device"
 */
export async function resetDevice({ id }: { id: string }): Promise<void> {
  if (id === "") {
    throw Error("The device name cannot be empty");
  }

  // Never revoke anything but a listed device (the server certificate and
  // the CA live in the same PKI)
  await assertDeviceExists(id);

  await removeClient(id);
  await buildClient(id);
}
