const expect = require("chai").expect;
const fs = require("file-system");
const util = require("util");
const logs = require("../../src/logs.js")(module);
const unlink = util.promisify(fs.unlink);
const { exec } = require("child_process");
let db = require("../../src/db");
const EthCrypto = require("eth-crypto");

/* eslint-disable no-console */

process.env.DYNDNS_DOMAIN = "dyndns.dapptest.io";
const dbPath = "./vpndb";

const generateKeys = require("../../src/dyndnsClient/generateKeys");

console.big = log => {
  console.log("\n\n\n\n\n\n\n");
  console.log(log);
  console.log("\n\n\n\n\n\n\n");
};

describe("generateKeys", function() {
  // Initialize calls

  let _db;

  describe("read non-existent file and create it", function() {
    before(async () => {
      // Restart db
      try {
        exec(`rm -r ${dbPath}`);
        db = require("../../src/db");
      } catch (e) {
        // console.big('Error removing db '+e);
      }
    });

    it("should return an identity object", async () => {
      await generateKeys();
      _db = Object.assign({}, await db.get());
      expect(_db).to.be.an("Object");
      expect(_db).to.have.property("address");
      expect(_db).to.have.property("domain");
      expect(_db).to.have.property("privateKey");
    });

    it("should contain a correct domain", async () => {
      // Check that the domain is correct
      const { domain, address } = _db;
      const [subdomain, ...host] = domain.split(".");
      expect(address.toLowerCase()).to.include(subdomain);
      expect(host.join(".")).to.equal(process.env.DYNDNS_DOMAIN);
    });

    it("should return the same identity the second time ", async () => {
      await generateKeys();
      expect(await db.get("privateKey")).to.deep.equal(_db.privateKey);
    });

    after(async () => {
      // Restart db
      try {
        fs.unlinkSync(dbPath);
      } catch (e) {
        //
      }
      // Clean files
      await unlink(process.env.KEYPAIR_PATH).catch(err => {
        logs.error("\n\n\n", err, "\n\n\n");
      });
    });
  });

  describe("recover a corrupted privateKey", () => {
    it("should detect that a privateKey is corrupted", async () => {
      // Store old private key and domain to assert the change
      const oldPrivateKey = await db.get("privateKey");
      const oldDomain = await db.get("domain");

      // corrupt the private key
      const corruptedPrivateKey =
        "******************************************************************";
      await db.set("privateKey", corruptedPrivateKey);

      // Call generateKeys. This function will be called always when the VPN resets
      await generateKeys();

      // Assert that a new valid private key is created.
      // Also that the domain changed
      const newPrivateKey = await db.get("privateKey");
      const newDomain = await db.get("domain");
      expect(newPrivateKey).to.not.equal(oldPrivateKey);
      expect(newPrivateKey).to.not.equal(corruptedPrivateKey);
      const publicKey = EthCrypto.publicKeyByPrivateKey(newPrivateKey);
      expect(publicKey).to.exist;
      expect(newDomain).to.not.equal(oldDomain);
    });
  });
});
