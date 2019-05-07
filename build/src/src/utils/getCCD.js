const fs = require("fs");
const path = require("path");
const ip = require("ip");
const logs = require("../logs.js")(module);

const ccdPath = process.env.DEV ? "./mockFiles/ccd" : "/etc/openvpn/ccd";

async function getCCD() {
  const ccdlist = [];
  await fs.readdirSync(ccdPath).forEach(async filename => {
    const filepath = path.join(ccdPath, filename);
    const stats = fs.statSync(filepath);
    if (!stats.isDirectory()) {
      const data = await fs.readFileSync(filepath, "utf-8");
      const fixedip = data.trim().split(" ")[1];
      if (ip.isV4Format(fixedip)) {
        ccdlist.push({ cn: filename, ip: fixedip });
      } else {
        logs.warn(`Invalid IP detected at ccd: ${filename}`);
      }
    }
  });
  return ccdlist;
}

module.exports = getCCD;
