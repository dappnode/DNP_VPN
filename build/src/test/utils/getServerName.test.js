const expect = require("chai").expect;
const fs = require("fs");
const shell = require("../../src/utils/shell");

const testFolder = "./mockFiles";
const filePath = `${testFolder}/serverName`;
process.env.SERVER_NAME_PATH = filePath;

const getServerName = require("../../src/utils/getServerName");

describe("Util: getServerName", function() {
  before(() => {
    try {
      fs.mkdirSync(testFolder);
    } catch (e) {
      //
    }
  });

  it("should return the default value if the file is missing", async () => {
    const serverName = await getServerName();
    expect(serverName).to.equal("DAppNode_server");
  });

  it("should return the default name if the file is empty", async () => {
    fs.writeFileSync(filePath, "");
    const serverName = await getServerName();
    expect(serverName).to.equal("DAppNode_server");
  });

  it("should return the assigned name if is valid", async () => {
    fs.writeFileSync(filePath, "myDAppNode");
    const serverName = await getServerName();
    expect(serverName).to.equal("myDAppNode");
  });

  after(async () => {
    try {
      await shell(`rm -rf ${testFolder}`);
    } catch (e) {
      //
    }
  });
});
