import { buildClient, getUserList } from "../openvpn";
import { USER_LIMIT } from "../params";

/**
 * Creates a new device with the provided id.
 * Generates certificates and keys needed for OpenVPN.
 * @param id "new-device"
 */
export async function addDevice({ id }: { id: string }): Promise<void> {
  if (id === "") throw Error("The new device name cannot be empty");
  if (
    (id || "").toLowerCase() === "guests" ||
    (id || "").toLowerCase() === "guest"
  )
    throw Error(
      `Please use the enable guests function to create a "Guest(s)" user`
    );

  const userArray = await getUserList();

  if (userArray.length >= USER_LIMIT)
    throw Error(`You have reached the max user limit: ${USER_LIMIT}`);

  if (!userArray.includes(id)) {
    await buildClient(id);
  } else {
    throw Error(`Device name exists: ${id}`);
  }
}
