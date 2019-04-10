const expect = require("chai").expect;
const proxyquire = require("proxyquire");

describe("Util: generate", function() {
  const dappnodeOtpUrl = "http://test-otp-link.io";
  process.env.DAPPNODE_OTP_URL = dappnodeOtpUrl;
  const generate = proxyquire("../../src/utils/generate", {
    "./getPublicEndpoint": async () => "84.53.12.1",
    "../db": {
      get: async key => {
        if (key == "name") return "myDAppNode";
        if (key == "psk") return "secret-psk";
        throw Error("Unknown key in fake db");
      }
    }
  });

  it("should get normal otp", async () => {
    const adminOtp = await generate.otp({
      user: "myDevice",
      pass: "secret-pass"
    });
    expect(adminOtp).to.equal(
      "http://test-otp-link.io#84.53.12.1&secret-psk&myDevice&secret-pass&myDAppNode"
    );
  });

  it("should get a min otp", async () => {
    const adminOtpMin = await generate.otp(
      {
        user: "dappnode_admin",
        pass: "secret-pass"
      },
      { min: true }
    );
    expect(adminOtpMin).to.equal(
      "http://test-otp-link.io#84.53.12.1&secret-psk&&secret-pass&"
    );
  });
});
