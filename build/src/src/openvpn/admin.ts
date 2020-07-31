import fs from "fs";
import path from "path";
import { getCCD } from "./getCCD";
import { getLowestIpFromRange } from "../utils/ip";
import {
  CCD_PATH,
  MASTER_ADMIN_NAME,
  MASTER_ADMIN_IP,
  ADMIN_IP_RANGE,
  CCD_MASK
} from "../params";

/**
 * Grants admin credentials to device `id` on IP `ip`
 * Warning: Does not enforce that `ip` actually holds admin priviledges
 * @param id "my-device"
 */
export function grantAdmin(id: string): void {
  const ip =
    id === MASTER_ADMIN_NAME
      ? MASTER_ADMIN_IP
      : getLowestIpFromRange(getCCD(), ADMIN_IP_RANGE);

  const ccdContent = `ifconfig-push ${ip} ${CCD_MASK}\r\n`;
  fs.writeFileSync(getCcdFilePath(id), ccdContent);
}

/**
 * Revokes admin credentials to device `id`
 * @param id "my-device"
 */
export function revokeAdmin(id: string): void {
  if (id === MASTER_ADMIN_NAME) throw Error(`Cannot revoke master admin`);
  try {
    fs.unlinkSync(getCcdFilePath(id));
  } catch (err) {
    throw Error(`Error revoking CCD file of: ${id}`);
  }
}

/**
 * Path to the CCD file that controls if a device is admin or not
 * @param id "my-device"
 */
function getCcdFilePath(id: string): string {
  return path.join(CCD_PATH, id);
}
