import "mocha";
import { expect } from "chai";
import sinon from "sinon";
import proxyquire from "proxyquire";

describe("openvpn > getClient", () => {
  const userList = ["dappnode_admin", "mobile"];
  const shell = sinon.stub().resolves("ovpn-file");
  const { getClient } = proxyquire("../../src/openvpn/getClient", {
    "../utils/shell": { shell },
    "../dappmanager/fetchInternalIp": {
      getInternalIpCached: async () => "192.168.1.10"
    },
    "./getUserList": {
      assertDeviceExists: async (id: string): Promise<void> => {
        if (!userList.includes(id)) throw Error(`Device name not found: ${id}`);
      }
    }
  });

  beforeEach(() => shell.resetHistory());

  it("should return the credentials of an existing device", async () => {
    expect(await getClient("mobile")).to.equal("ovpn-file");
    expect(shell.firstCall.args[1]).to.deep.equal(["mobile"]);
  });

  // pki/private also holds ca.key and the server key
  for (const id of ["ca", "my-server.dyndns.dappnode.io", "*"]) {
    it(`should not read key material for non-device id ${id}`, async () => {
      let error = "--- getClient did not throw ---";
      try {
        await getClient(id);
      } catch (e) {
        error = (e as Error).message;
      }
      expect(error).to.not.equal("--- getClient did not throw ---");
      expect(shell.called).to.equal(false);
    });
  }
});
