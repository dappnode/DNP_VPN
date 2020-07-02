import { expect } from "chai";
import sinon from "sinon";
import proxyquire from "proxyquire";

describe("Call function: listDevices", () => {
  // This function calls getUserList and getCCD to build
  // a list of objects with id and admin boolean
  const userList = ["dappnode_admin", "mobile", "guest", "tom"];
  const ccdList = [
    { cn: "dappnode_admin", ip: "172.33.0.1" },
    { cn: "tom", ip: "172.33.0.2" }
  ];
  const userResult = [
    { id: "dappnode_admin", admin: true, ip: "" },
    { id: "mobile", admin: false, ip: "" },
    { id: "guest", admin: false, ip: "" },
    { id: "tom", admin: true, ip: "" }
  ];
  // sinon.replace(,));   <--- to replace an inside function
  const getUserList = sinon.stub();
  getUserList.resolves(userList);
  const getCCD = sinon.stub();
  getCCD.returns(ccdList);
  const { listDevices } = proxyquire("../../src/calls/listDevices", {
    "../utils/getUserList": { getUserList },
    "../utils/getCCD": { getCCD }
  });

  it("should return success message and the users array", async () => {
    const result = await listDevices();
    expect(result).to.be.an("array");
    expect(result).to.deep.equal(userResult);
  });
});
