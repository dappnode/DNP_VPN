import { getClient } from "../openvpn";

/**
 * Returns the credentials file (.ovpn) for device `id`
 * @param id "new-device"
 */
export async function getCredFile({ id }: { id: string }): Promise<string> {
  return await getClient(id);
}
