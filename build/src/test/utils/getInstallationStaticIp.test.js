const chai = require("chai");
const expect = require("chai").expect;
const fs = require("fs");
const shell = require("../../src/utils/shell");

chai.should();

const testFolder = "./mockFiles";
const filePath = `${testFolder}/staticIp`;
process.env.INSTALLATION_STATIC_IP = filePath;

const getInstallationStaticIp = require("../../src/utils/getInstallationStaticIp");

describe("Util: getInstallationStaticIp", function() {
  before(() => {
    try {
      fs.mkdirSync(testFolder);
    } catch (e) {
      //
    }
  });

  it("should return null if the file is missing", async () => {
    const staticIp = await getInstallationStaticIp();
    expect(staticIp).to.equal(null);
  });

  it("should return null if the file is empty", async () => {
    fs.writeFileSync(filePath, "");
    const staticIp = await getInstallationStaticIp();
    expect(staticIp).to.equal(null);
  });

  it("should return null if the ip is incorrect", async () => {
    fs.writeFileSync(filePath, "333.45.43.1111");
    const staticIp = await getInstallationStaticIp();
    expect(staticIp).to.equal(null);
  });

  it("should return the ip if the ip is valid", async () => {
    const ip = "85.84.83.82";
    fs.writeFileSync(filePath, ip);
    const staticIp = await getInstallationStaticIp();
    expect(staticIp).to.equal(ip);
  });

  after(async () => {
    try {
      await shell(`rm -rf ${testFolder}`);
    } catch (e) {
      //
    }
  });
});
