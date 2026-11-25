import "mocha";
import { expect } from "chai";
import sinon from "sinon";
import proxyquire from "proxyquire";

describe("Call function: resetDevice", () => {
  const userList = ["dappnode_admin", "mobile"];
  const removeClient = sinon.stub().resolves();
  const buildClient = sinon.stub().resolves();
  const assertDeviceExists = async (id: string): Promise<void> => {
    if (!userList.includes(id)) throw Error(`Device name not found: ${id}`);
  };
  const { resetDevice } = proxyquire("../../src/calls/resetDevice", {
    "../openvpn": { assertDeviceExists, removeClient, buildClient }
  });

  beforeEach(() => {
    removeClient.resetHistory();
    buildClient.resetHistory();
  });

  it("should reset an existing device", async () => {
    await resetDevice({ id: "mobile" });
    expect(removeClient.calledOnceWith("mobile")).to.equal(true);
    expect(buildClient.calledOnceWith("mobile")).to.equal(true);
  });

  // The CA and the server certificate live in the same PKI as the devices
  for (const id of ["ca", "my-server.dyndns.dappnode.io", "unknown"]) {
    it(`should not revoke anything for non-device id ${id}`, async () => {
      let error = "--- resetDevice did not throw ---";
      try {
        await resetDevice({ id });
      } catch (e) {
        error = (e as Error).message;
      }
      expect(error).to.equal(`Device name not found: ${id}`);
      expect(removeClient.called).to.equal(false);
      expect(buildClient.called).to.equal(false);
    });
  }
});
