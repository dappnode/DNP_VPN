const proxyquire = require("proxyquire");
const expect = require("chai").expect;
const pause = require("../src/utils/pause");

describe("InitializeApp", () => {
  let fakeDb = {};
  const db = {
    get: async key => fakeDb[key],
    set: async (key, val) => {
      fakeDb[key] = val;
    }
  };

  it("Should return the expected booleans on an UPnP case", async () => {
    // initialize app will be run on loead
    proxyquire("../src/initializeApp", {
      "./db": db,
      "./dyndnsClient": { generateKeys: async () => {} },
      "./utils/getServerName": async () => "myDAppNode1",
      "./utils/getInternalIp": async () => "192.168.1.0",
      "./utils/getStaticIp": async () => null,
      "./utils/getExternalUpnpIp": async () => "85.84.83.82",
      "./utils/getPublicIpFromUrls": async () => "98.97.96.95",
      "./utils/ping": async () => true
    });

    await pause(50);

    expect(fakeDb).to.deep.include({
      ip: "85.84.83.82",
      name: "myDAppNode1",
      upnpAvailable: true,
      noNatLoopback: false,
      alertToOpenPorts: false,
      internalIp: "192.168.1.0"
    });
  });

  it("Should return the expected booleans on an UPnP + static IP case", async () => {
    // initialize app will be run on loead
    proxyquire("../src/initializeApp", {
      "./db": db,
      "./dyndnsClient": { generateKeys: async () => {} },
      "./utils/getServerName": async () => "myDAppNode2",
      "./utils/getInternalIp": async () => "192.168.1.0",
      "./utils/getStaticIp": async () => "1.2.3.4",
      "./utils/getExternalUpnpIp": async () => "85.84.83.82",
      "./utils/getPublicIpFromUrls": async () => "98.97.96.95",
      "./utils/ping": async () => true
    });

    await pause(50);

    expect(fakeDb).to.deep.include({
      ip: "1.2.3.4",
      name: "myDAppNode2",
      upnpAvailable: true,
      noNatLoopback: false,
      alertToOpenPorts: false,
      internalIp: "192.168.1.0"
    });
  });

  it("Should return the expected booleans on an static IP + exposed to the internet case", async () => {
    // initialize app will be run on loead
    proxyquire("../src/initializeApp", {
      "./db": db,
      "./dyndnsClient": { generateKeys: async () => {} },
      "./utils/getServerName": async () => "myDAppNode3",
      "./utils/getInternalIp": async () => "1.2.3.4",
      "./utils/getStaticIp": async () => "1.2.3.4",
      "./utils/getExternalUpnpIp": async () => "85.84.83.82",
      "./utils/getPublicIpFromUrls": async () => "98.97.96.95",
      "./utils/ping": async () => true
    });

    await pause(50);

    expect(fakeDb).to.deep.include({
      ip: "1.2.3.4",
      name: "myDAppNode3",
      upnpAvailable: false,
      noNatLoopback: false,
      alertToOpenPorts: false,
      internalIp: "1.2.3.4"
    });
  });
});
