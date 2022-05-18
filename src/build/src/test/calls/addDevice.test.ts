import "mocha";
import { expect } from "chai";
import sinon from "sinon";
import proxyquire from "proxyquire";

describe("Call function: addDevice", () => {
  const userList = ["dappnode_admin", "mobile", "guest", "tom"];

  const getUserList = sinon.stub();
  getUserList.resolves(userList);
  const buildClient = sinon.stub();
  buildClient.resolves("");
  const { addDevice } = proxyquire("../../src/calls/addDevice", {
    "../openvpn": { getUserList, buildClient }
  });
  it("should return success message when the user does not exist", async () => {
    const id = "new_user";
    await addDevice({ id });
  });

  it("should return error message when the user does exist", async () => {
    const id = "tom";
    let error = "--- addDevice did not throw ---";
    try {
      await addDevice({ id });
    } catch (e) {
      error = e.message;
    }
    expect(error).to.equal(`Device name exists: ${id}`);
  });
});
