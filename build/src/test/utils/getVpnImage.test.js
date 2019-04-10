const expect = require("chai").expect;
const proxyquire = require("proxyquire");

const vpnImage = "vpn.dnp.dappnode.eth:0.1.21";

describe("Util: getVpnImage", () => {
  const getVpnImage = proxyquire("../../src/utils/getVpnImage", {
    "./shell": async () => vpnImage
  });

  it("should get normal otp", async () => {
    const _vpnImage = await getVpnImage();
    expect(_vpnImage).to.equal(vpnImage);
  });
});
