const ip = require("ip");

const ipRange = ["172.33.10.2", "172.33.11.250"];

function getLowestIP(ccdList) {
  let lowest = ip.toLong(ipRange[0]);
  ccdList
    .sort((a, b) => ip.toLong(a.ip) - ip.toLong(b.ip))
    .every(item => {
      if (ip.toLong(item.ip) > lowest) {
        return false;
      } else {
        lowest++;
        return true;
      }
    });
  if (lowest > ip.toLong(ipRange[1])) {
    throw Error("Maximum admin users reached.");
  }
  return ip.fromLong(lowest);
}

module.exports = getLowestIP;
