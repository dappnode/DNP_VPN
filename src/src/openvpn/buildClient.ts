import { shell } from "../utils/shell";
import { assertValidDeviceId } from "../utils/deviceId";

/**
 * @param id "new-device"
 */
export async function buildClient(id: string): Promise<void> {
  assertValidDeviceId(id);
  try {
    await shell("easyrsa", ["build-client-full", id, "nopass"]);
  } catch (err) {
    throw Error(`Error building client: ${(err as Error).message}`);
  }
}
