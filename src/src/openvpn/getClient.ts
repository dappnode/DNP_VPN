import { getInternalIpCached } from "../dappmanager/fetchInternalIp";
import { shell } from "../utils/shell";
import { assertValidDeviceId } from "../utils/deviceId";

const fetchCredsCommand = "/usr/local/bin/ovpn_getclient";

/**
 * Returns the .ovpn file of an existing client in plain text
 * @param id "new-device"
 */
export async function getClient(id: string): Promise<string> {
  assertValidDeviceId(id);
  const DAPPNODE_INTERNAL_IP = await getInternalIpCached();

  try {
    return await shell(fetchCredsCommand, [id], {
      env: { ...process.env, DAPPNODE_INTERNAL_IP }
    });
  } catch (err) {
    throw Error(`Error retrieving client ${id}: ${(err as Error).message}`);
  }
}
