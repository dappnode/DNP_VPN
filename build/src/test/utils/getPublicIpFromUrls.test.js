const expect = require("chai").expect;
const proxyquire = require("proxyquire");

// Purpose of the test
// Fake wget responses and ensure the custom control flow works
const ip = "85.84.83.82";

describe("Util: getPublicIpFromUrls", () => {
  const getPublicIpFromUrls = proxyquire(
    "../../src/utils/getPublicIpFromUrls",
    {
      "./shell": async cmd => {
        const res = x => new Promise(r => setTimeout(() => r(x), 5));
        if (cmd.includes("ns.dappnode.io")) {
          return await res(ip);
        } else if (cmd.includes("ipv4.icanhazip.com")) {
          return await res("<html><title>404</title></html>");
        } else {
          throw Error("No valid response");
        }
      }
    }
  );

  it("should handle errors and return a valid IP", async () => {
    const _ip = await getPublicIpFromUrls();
    expect(_ip).to.equal(ip);
  });
});
