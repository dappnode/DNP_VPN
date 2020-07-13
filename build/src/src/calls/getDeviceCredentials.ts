import { getClient } from "../openvpn";
import { VpnDeviceCredentials } from "../types";
import { getConnectUrl } from "../credentials";

/**
 * Returns a URL browsable from outside the DAppNode network
 * The URL contains necessary credentials (token + encryption key) to retrieve
 * and download an OpenVPN credentials file for the device `id`
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
