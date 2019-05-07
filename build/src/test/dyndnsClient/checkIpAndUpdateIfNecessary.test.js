const proxyquire = require("proxyquire");
const chai = require("chai");
const expect = require("chai").expect;
const sinon = require("sinon");

chai.should();

function importModule({
  updateIp,
  db,
  lookup,
  getExternalUpnpIp,
  getPublicIpFromUrls
}) {
  return proxyquire("../../src/dyndnsClient/checkIpAndUpdateIfNecessary", {
    "./updateIp": updateIp,
    "../db": db,
    "../utils/lookup": lookup,
    "../utils/getExternalUpnpIp": getExternalUpnpIp,
    "../utils/getPublicIpFromUrls": getPublicIpFromUrls
  });
}
function dbFactory(_db) {
  return {
    get: async key => _db[key],
    set: async (key, val) => (_db[key] = val)
  };
}

describe("Call function: addDevice", function() {
  it("should NOT call update on a regular case", async () => {
    const ip = "85.84.83.82";
    const updateIp = sinon.stub().resolves();
    const checkIpAndUpdateIfNecessary = importModule({
      updateIp,
      db: dbFactory({ ip, domain: "my.domain" }),
      lookup: async () => ip,
      getExternalUpnpIp: async () => ip,
      getPublicIpFromUrls: async () => ip
    });

    await checkIpAndUpdateIfNecessary();

    sinon.assert.notCalled(updateIp);
  });

  it("should CALL update if the IP changes", async () => {
    const ip = "85.84.83.82";
    const newIp = "200.1.2.1";
    const _db = { ip, domain: "my.domain" };
    const updateIp = sinon.stub().resolves();
    const checkIpAndUpdateIfNecessary = importModule({
      updateIp,
      db: dbFactory(_db),
      lookup: async () => ip,
      getExternalUpnpIp: async () => null,
      getPublicIpFromUrls: async () => newIp
    });

    await checkIpAndUpdateIfNecessary();

    sinon.assert.calledOnce(updateIp);
    expect(_db.ip).to.equal(newIp);
  });

  it("should CALL update if the DynDNS record gets corrupt", async () => {
    const ip = "85.84.83.82";
    const corruptIp = "200.1.2.1";
    const domain = "my.domain";
    const updateIp = sinon.stub().resolves();
    const lookup = sinon.stub().resolves(corruptIp);
    const checkIpAndUpdateIfNecessary = importModule({
      updateIp,
      db: dbFactory({ ip, domain }),
      lookup,
      getExternalUpnpIp: async () => null,
      getPublicIpFromUrls: async () => ip
    });

    await checkIpAndUpdateIfNecessary();

    sinon.assert.calledOnce(updateIp);
    sinon.assert.calledOnce(lookup);
    sinon.assert.calledWith(lookup, domain);
  });
});
