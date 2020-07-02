import { expect } from "chai";
import sinon from "sinon";
import proxyquire from "proxyquire";

describe("Call function: removeDevice", () => {
  // This function calls getUserList and getCCD to build
  // a list of objects with id and admin boolean
  const userList = ["dappnode_admin", "mobile", "guest", "tom"];
  const ccdList = [
    { cn: "dappnode_admin", ip: "172.33.0.1" },
    { cn: "tom", ip: "172.33.0.2" }
  ];
  const getUserList = sinon.stub();
  getUserList.resolves(userList);
  const getCCD = sinon.stub();
  getCCD.returns(ccdList);
  const removeClient = sinon.stub();
  removeClient.resolves("");

  const { removeDevice } = proxyquire("../../src/calls/removeDevice", {
    "../utils/getUserList": { getUserList },
    "../utils/getCCD": { getCCD },
    "../utils/removeClient": { removeClient }
  });

  it("should return success message when user is not admin", async () => {
    const id = "mobile";
    await removeDevice({ id });
  });

  it("should return error message when the user does not exist", async () => {
    const id = "Santa";
    let error = "--- removeDevice did not throw ---";
    try {
      await removeDevice({ id });
    } catch (e) {
      error = e.message;
    }
    expect(error).to.equal(`Device name not found: ${id}`);
  });

  it("should return error message when the user is admin", async () => {
    const id = "dappnode_admin";
    let error = "--- removeDevice did not throw ---";
    try {
      await removeDevice({ id });
    } catch (e) {
      error = e.message;
    }
    expect(error).to.equal("You cannot remove an admin user");
  });
});
