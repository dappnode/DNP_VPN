const expect = require("chai").expect;
const shell = require("../../src/utils/shell");

const testFolder = "./mockFiles";
process.env.DEV = true;
const credentialsFile = require("../../src/utils/credentialsFile");

describe("Util: credentialsFile", function() {
  const credentialsArray = [
    {
      name: "SUPERadmin",
      password: "MockPass2",
      ip: "172.33.10.1"
    },
    {
      name: "MockName",
      password: "MockPass",
      ip: "172.33.100.123"
    }
  ];

  before(async () => {
    try {
      await shell(`mkdir -p ${testFolder}`);
    } catch (e) {
      //
    }
  });

  it("should write the file", async () => {
    credentialsFile.write(credentialsArray);
  });

  it("should read the file", async () => {
    const credentialsArrayRes = credentialsFile.fetch();
    expect(credentialsArrayRes).to.deep.equal(credentialsArray);
  });

  after(async () => {
    try {
      await shell(`rm -rf ${testFolder}`);
    } catch (e) {
      //
    }
  });
});
