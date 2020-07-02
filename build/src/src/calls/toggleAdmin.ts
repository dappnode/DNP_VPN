import fs from "fs";
import path from "path";
import { getCCD } from "../utils/getCCD";
import { getUserList } from "../utils/getUserList";
import { getLowestIP } from "../utils/getLowestIP";
import { masterAdmin, ccdPath, ccdMask } from "../params";

/**
 * Gives/removes admin rights to the provided device id.
 * @param id "new-device"
 */
export async function toggleAdmin({ id }: { id: string }) {
  const devices = await getUserList();
  if (!devices.includes(id)) {
    throw Error(`Device not found: ${id}`);
  }

  const ccdArray = getCCD();
  const isAdmin = ccdArray.find(c => c.cn === id);

  if (id === masterAdmin) {
    throw Error("You cannot remove the master admin user");
  } else if (isAdmin) {
    try {
      fs.unlinkSync(path.join(ccdPath, id));
    } catch (err) {
      throw Error(`Failed to remove ccd from: ${id}`);
    }
  } else {
    const ccdContent = `ifconfig-push ${getLowestIP(ccdArray)} ${ccdMask}\r\n`;
    fs.writeFileSync(path.join(ccdPath, id), ccdContent);
  }
}
