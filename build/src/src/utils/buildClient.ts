import { shell } from "../utils/shell";

/**
 * @param id "new-device"
 */
export async function buildClient(id: string): Promise<void> {
  try {
    await shell(`easyrsa build-client-full ${id} nopass`);
  } catch (err) {
    throw Error(`Error building client: ${err.message}`);
  }
}
