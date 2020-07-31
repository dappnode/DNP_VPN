import fs from "fs";
import path from "path";
import ip from "ip";
import { logs } from "../logs";
import { CCD_PATH } from "../params";
import { OpenVpnCCDItem } from "../types";

export function getCCD(): OpenVpnCCDItem[] {
  const ccdlist: OpenVpnCCDItem[] = [];
  for (const filename of fs.readdirSync(CCD_PATH)) {
    const filepath = path.join(CCD_PATH, filename);
    if (!fs.statSync(filepath).isDirectory()) {
      const data = fs.readFileSync(filepath, "utf-8");
      const fixedip = data.trim().split(" ")[1];
      if (ip.isV4Format(fixedip)) {
        ccdlist.push({ cn: filename, ip: fixedip });
      } else {
        logs.warn(`Invalid IP detected at ccd: ${filename}`);
      }
    }
  }
  return ccdlist;
}
