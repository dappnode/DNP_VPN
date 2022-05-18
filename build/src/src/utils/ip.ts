import ip from "ip";

/**
 * Given a collection of IPs, returns the lowest
 * @param ips
 */
export function getLowestIpFromRange(
  ips: { ip: string }[],
  ipRange: string[]
): string {
  let lowest = ip.toLong(ipRange[0]);
  ips
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
