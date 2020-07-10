import { getClient } from "../openvpn";
import { VpnDeviceCredentials } from "../types";
import { getConnectUrl } from "../credentials/credentialsFile";

/**
 * Creates a new OpenVPN credentials file, encrypted.
 * The filename is the (16 chars short) result of hashing the generated salt in the db,
 * concatenated with the device id.
 * @param id "new-device"
 */
export async function getDeviceCredentials({
  id
}: {
  id: string;
}): Promise<VpnDeviceCredentials> {
  // Make sure the client exists
  await getClient(id);

  return { url: getConnectUrl(id) };
}
