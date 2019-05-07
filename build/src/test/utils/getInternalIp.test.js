const expect = require("chai").expect;
const proxyquire = require("proxyquire");

const vpnImage = "vpn.dnp.dappnode.eth:0.1.21";
const expectedCmd =
  "docker run --rm --net=host vpn.dnp.dappnode.eth:0.1.21 ip route get 1";
const cmdOutput = `1.0.0.0 via 85.84.96.1 dev eth0 src 85.84.83.82 uid 0 
    cache `;

describe("Util: getInternalIp", () => {
  const getInternalIp = proxyquire("../../src/utils/getInternalIp", {
    "./shell": async cmd => {
      if (cmd.trim() === expectedCmd.trim()) {
        return cmdOutput;
      } else {
        throw Error(`Unknown cmd: ${cmd}`);
      }
    },
    "./getVpnImage": async () => vpnImage
  });

  it("should get normal otp", async () => {
    const internalIp = await getInternalIp();
    expect(internalIp).to.equal("85.84.83.82");
  });
});
