import "mocha";
import { expect } from "chai";
import fs from "fs";
import { shell } from "../src/utils/shell";
import {
  addDevice,
  removeDevice,
  toggleAdmin,
  listDevices
} from "../src/calls";

describe("Integration test", () => {
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

  describe("Call function: toggleAdmin", () => {
    it("should call toggleAdmin without crashing and return message", async () => {
      const res = await toggleAdmin({ id: id0 });
      expect(res).to.have.property(
        "message",
        `Given admin credentials to ${id0}`
      );
    });

    it("should have changed the user to admin", async () => {
      const devices = await listDevices();

      const user = devices.find(d => d.id == id0);
      if (!user) throw Error(`user ${id0} does not exist`);

      const CcdFile = fs.existsSync(`/etc/openvpn/ccd/${user.id}`);
      expect(CcdFile).to.be.ok;
    });
  });

  describe("Cannot remove an admin user", () => {
    it("should throw an error", async () => {
      let error = "did not throw";
      try {
        await removeDevice({ id: id0 });
      } catch (e) {
        error = e.message;
      }
      expect(error).to.equal("You cannot remove an admin user");
    });
  });

  describe("Undo admin", () => {
    it("should call toggleAdmin without crashing and return success", async () => {
      const res = await toggleAdmin({ id: id0 });
      expect(res).to.have.property(
        "message",
        `Removed admin credentials from ${id0}`
      );
    });

    it("should have changed the user to NON admin ", async () => {
      const devices = await listDevices();

      const user = devices.find(d => d.id == id0);
      if (!user) throw Error(`user ${id0} does not exist`);

      const CcdFile = fs.existsSync(`/etc/openvpn/ccd/${user.id}`);
      expect(CcdFile).to.not.be.ok;
    });
  });

  describe("Add a couple of admins", () => {
    it("should called addDevice for first user", async () => {
      const res = await addDevice({ id: id1 });
      expect(res).to.have.property("message", `Added device: ${id1}`);
    });

    it("should called addDevice for second user", async () => {
      const res = await addDevice({ id: id2 });
      expect(res).to.have.property("message", `Added device: ${id2}`);
    });

    it("should call toggleAdmin to the first user", async () => {
      const res = await toggleAdmin({ id: id1 });
      expect(res).to.have.property(
        "message",
        `Given admin credentials to ${id1}`
      );
    });

    it("should call toggleAdmin to the second user", async () => {
      const res = await toggleAdmin({ id: id2 });
      expect(res).to.have.property(
        "message",
        `Given admin credentials to ${id2}`
      );
    });

    it("should have changed the first user to admin", () => {
      const CcdFile = fs.existsSync(`/etc/openvpn/ccd/${id1}`);
      expect(CcdFile).to.be.ok;
    });

    it("should have changed the second user to admin", () => {
      const CcdFile = fs.existsSync(`/etc/openvpn/ccd/${id2}`);
      expect(CcdFile).to.be.ok;
    });

    it("should call toggleAdmin to the first user", async () => {
      const res = await toggleAdmin({ id: id1 });
      expect(res).to.have.property(
        "message",
        `Removed admin credentials from ${id1}`
      );
    });

    it("should have changed the first user to non admin", () => {
      const CcdFile = fs.existsSync(`/etc/openvpn/ccd/${id1}`);
      expect(CcdFile).to.not.be.ok;
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
