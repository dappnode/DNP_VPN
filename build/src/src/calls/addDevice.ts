import { buildClient } from "../utils/buildClient";
import { getUserList } from "../utils/getUserList";
import { userLimit } from "../params";

/**
 * Creates a new device with the provided id.
 * Generates certificates and keys needed for OpenVPN.
 * @param id "new-device"
 */
export async function addDevice({ id }: { id: string }) {
  if (id === "") {
    throw Error("The new device name cannot be empty");
  }
  if (
    (id || "").toLowerCase() === "guests" ||
    (id || "").toLowerCase() === "guest"
  ) {
    throw Error(
      `Please use the enable guests function to create a "Guest(s)" user`
    );
  }

  const userArray = await getUserList();

  if (userArray.length >= userLimit) {
    throw Error(`You have reached the max user limit: ${userLimit}`);
  }

  if (!userArray.includes(id)) {
    await buildClient(id);
  } else {
    throw Error(`Device name exists: ${id}`);
  }
}
