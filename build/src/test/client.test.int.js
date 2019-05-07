const chai = require("chai");
const expect = require("chai").expect;
const calls = require("../src/calls");
const shell = require("../src/utils/shell");
const fs = require("fs");

chai.should();

describe("Integration test", () => {
  const ids = ["Jordi", "Hal", "Wardog"];

  // Initialize calls
  const { addDevice, removeDevice, toggleAdmin, listDevices } = calls;

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
      const res = await addDevice({ id: ids[0] });
      expect(res).to.have.property("message", `Added device: ${ids[0]}`);
    });

    let user;
    it("user should actually exist", async () => {
      const res = await listDevices();
      user = res.result.find(d => d.id == ids[0]);
      expect(user).to.be.ok;
    });

    it("should have created a user without admin rights: without ccd file.", () => {
      const CcdFile = fs.existsSync(`/etc/openvpn/ccd/${user.id}`);
      expect(CcdFile).to.not.be.ok;
    });
  });

  describe("Cannot create a user with the same name", () => {
    it("should throw an error", async () => {
      let error = "did not throw";
      try {
        await addDevice({ id: ids[0] });
      } catch (e) {
        error = e.message;
      }
      expect(error).to.equal(`Device name exists: ${ids[0]}`);
    });
  });

  describe("Call function: toggleAdmin", () => {
    it("should call toggleAdmin without crashing and return message", async () => {
      const res = await toggleAdmin({ id: ids[0] });
      expect(res).to.have.property(
        "message",
        `Given admin credentials to ${ids[0]}`
      );
    });

    let user;
    it("should still exist", async () => {
      const res = await listDevices();
      user = res.result.find(d => d.id == ids[0]);
      expect(user).to.be.ok;
    });

    it("should have changed the user to admin", () => {
      const CcdFile = fs.existsSync(`/etc/openvpn/ccd/${user.id}`);
      expect(CcdFile).to.be.ok;
    });
  });

  describe("Cannot remove an admin user", () => {
    it("should throw an error", async () => {
      let error = "did not throw";
      try {
        await removeDevice({ id: ids[0] });
      } catch (e) {
        error = e.message;
      }
      expect(error).to.equal("You cannot remove an admin user");
    });
  });

  describe("Undo admin", () => {
    it("should call toggleAdmin without crashing and return success", async () => {
      const res = await toggleAdmin({ id: ids[0] });
      expect(res).to.have.property(
        "message",
        `Removed admin credentials from ${ids[0]}`
      );
    });

    let user;
    it("should have changed the user without ccd", async () => {
      // Fetching devices
      let res = await listDevices();
      // Searching device
      user = res.result.find(d => d.id == ids[0]);
      expect(user).to.be.ok;
    });

    it("should have changed the user to NON admin ", () => {
      let CcdFile = fs.existsSync(`/etc/openvpn/ccd/${user.id}`);
      expect(CcdFile).to.not.be.ok;
    });
  });

  describe("Add a couple of admins", () => {
    it("should called addDevice for first user", async () => {
      const res = await addDevice({ id: ids[1] });
      expect(res).to.have.property("message", `Added device: ${ids[1]}`);
    });

    it("should called addDevice for second user", async () => {
      const res = await addDevice({ id: ids[2] });
      expect(res).to.have.property("message", `Added device: ${ids[2]}`);
    });

    it("should call toggleAdmin to the first user", async () => {
      const res = await toggleAdmin({ id: ids[1] });
      expect(res).to.have.property(
        "message",
        `Given admin credentials to ${ids[1]}`
      );
    });

    it("should call toggleAdmin to the second user", async () => {
      const res = await toggleAdmin({ id: ids[2] });
      expect(res).to.have.property(
        "message",
        `Given admin credentials to ${ids[2]}`
      );
    });

    it("should have changed the first user to admin", () => {
      const CcdFile = fs.existsSync(`/etc/openvpn/ccd/${ids[1]}`);
      expect(CcdFile).to.be.ok;
    });

    it("should have changed the second user to admin", () => {
      const CcdFile = fs.existsSync(`/etc/openvpn/ccd/${ids[2]}`);
      expect(CcdFile).to.be.ok;
    });

    it("should call toggleAdmin to the first user", async () => {
      const res = await toggleAdmin({ id: ids[1] });
      expect(res).to.have.property(
        "message",
        `Removed admin credentials from ${ids[1]}`
      );
    });

    it("should have changed the first user to non admin", () => {
      let CcdFile = fs.existsSync(`/etc/openvpn/ccd/${ids[1]}`);
      expect(CcdFile).to.not.be.ok;
    });
  });

  describe("Call function: removeDevice", () => {
    it("should call removeDevice without crashing", async () => {
      const res = await removeDevice({ id: ids[0] });
      expect(res).to.have.property("message", `Removed device: ${ids[0]}`);
    });

    it("should actually be deleted", async () => {
      const res = await listDevices();
      const user = res.result.find(d => d.id == ids[0]);
      expect(user).to.not.be.ok;
    });
  });
});
