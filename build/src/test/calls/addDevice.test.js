const proxyquire = require("proxyquire");
const chai = require("chai");
const expect = require("chai").expect;
const sinon = require("sinon");

chai.should();

describe("Call function: addDevice", function() {
  const userList = ["dappnode_admin", "mobile", "guest", "tom"];

  const getUserList = sinon.stub();
  getUserList.resolves(userList);
  const buildClient = sinon.stub();
  buildClient.resolves("");
  const addDevice = proxyquire("../../src/calls/addDevice", {
    "../utils/getUserList": getUserList,
    "../utils/buildClient": buildClient
  });
  it("should return success message when the user does not exist", async () => {
    let id = "new_user";
    let res = await addDevice({ id });
    expect(res).to.have.property("message");
    expect(res.message).to.deep.equal(`Added device: ${id}`);
  });

  it("should return error message when the user does exist", async () => {
    let id = "tom";
    let error = "--- addDevice did not throw ---";
    try {
      await addDevice({ id });
    } catch (e) {
      error = e.message;
    }
    expect(error).to.equal(`Device name exists: ${id}`);
  });
});
