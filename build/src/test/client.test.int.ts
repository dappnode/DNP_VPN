import "mocha";
import { expect } from "chai";
import fs from "fs";
import { shell } from "../src/utils/shell";
import { addDevice, removeDevice, listDevices } from "../src/calls";

// This test need to be run in a special environment with access to
// the OpenVPN binaries and other features available only in the production
// container of the VPN.
describe.skip("Integration test", () => {
  const id0 = "Jordi";
  const id1 = "Hal";
  const id2 = "Wardog";

  // Create config files
  before(async () => {
    // Verify test setup
    // Only run on linux
    if (process.platform !== "linux") {
      throw Error("The integration test must be run in a linux platform");
    }
    if (!fs.existsSync("/usr/local/bin/ovpn_genconfig")) {
      throw Error("OpenVPN binaries were not found in /usr/local/bin/");
    }
    try {
      await shell("ovpn_genconfig -c -d -u udp://test -s 172.33.8.0/23");
      await shell("EASYRSA_REQ_CN=test ovpn_initpki nopass");
      await shell("easyrsa build-client-full dappnode_admin nopass");
      await shell("easyrsa build-client-full luser nopass");
    } catch (e) {
      throw Error(`Cannot initalize: ${e}`);
    }
  });

  describe("Call function: createAddDevice", () => {
    it("should called addDevice without crashing and return message", async () => {
      const res = await addDevice({ id: id0 });
      expect(res).to.have.property("message", `Added device: ${id0}`);
    });

    it("should have created a user without admin rights: without ccd file.", async () => {
      const devices = await listDevices();

      const user = devices.find(d => d.id == id0);
      if (!user) throw Error(`user ${id0} does not exist`);

      const CcdFile = fs.existsSync(`/etc/openvpn/ccd/${user.id}`);
      expect(CcdFile).to.not.be.ok;
    });
  });

  describe("Cannot create a user with the same name", () => {
    it("should throw an error", async () => {
      let error = "did not throw";
      try {
        await addDevice({ id: id0 });
      } catch (e) {
        error = e.message;
      }
      expect(error).to.equal(`Device name exists: ${id0}`);
    });
  });

  describe("Add a couple of users", () => {
    it("should called addDevice for first user", async () => {
      const res = await addDevice({ id: id1 });
      expect(res).to.have.property("message", `Added device: ${id1}`);
    });

    it("should called addDevice for second user", async () => {
      const res = await addDevice({ id: id2 });
      expect(res).to.have.property("message", `Added device: ${id2}`);
    });
  });

  describe("Call function: removeDevice", () => {
    it("should call removeDevice without crashing", async () => {
      const res = await removeDevice({ id: id0 });
      expect(res).to.have.property("message", `Removed device: ${id0}`);
    });

    it("should actually be deleted", async () => {
      const devices = await listDevices();
      const user = devices.find(d => d.id == id0);
      expect(user).to.not.be.ok;
    });
  });
});
