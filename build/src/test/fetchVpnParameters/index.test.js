const chai = require('chai');
const expect = require('chai').expect;
const fs = require('fs');
const db = require('../../src/db');

/* eslint-disable */
console.big = (log) => {
  console.log('\n\n\n\n\n\n\n');
  console.log(log);
  console.log('\n\n\n\n\n\n\n');
};
/* eslint-enable */


const paramsToWrite = {
  staticIp: {data: '85.34.3.13', envName: 'INSTALLATION_STATIC_IP'},
  ip: {data: 'fakeIp', envName: 'PUBLIC_IP_PATH'},
  psk: {data: 'fakePsk', envName: 'PSK_PATH'},
  name: {data: 'fakeName', envName: 'SERVER_NAME_PATH'},
  internalIp: {data: 'fakeInternalIp', envName: 'INTERNAL_IP_PATH'},
  externalIp: {data: 'fakeExternalIp', envName: 'EXTERNAL_IP_PATH'},
  publicIpResolved: {data: '1', envName: 'PUBLIC_IP_RESOLVED_PATH'},
};

const testFoler = './mockFiles';
Object.keys(paramsToWrite).forEach((paramName) => {
  const param = paramsToWrite[paramName];
  param.path = `${testFoler}/${paramName}`;
  process.env[param.envName] = param.path;
});
process.env.DYNDNS_HOST = 'dyn.test.io';

const fetchVpnParameters = require('../../src/fetchVpnParameters');
const logAdminCredentials = require('../../src/logAdminCredentials');

chai.should();

describe('fetchVpnParameters test', function() {
  before(() => {
    // Restart db
    try {
      fs.unlinkSync('./db.json');
    } catch (e) {
      //
    }
    // Create the files
    try {
      fs.mkdirSync('./mockFiles');
    } catch (e) {
      //
    }
    Object.keys(paramsToWrite).forEach((paramName) => {
      const param = paramsToWrite[paramName];
      fs.writeFileSync(param.path, param.data, 'utf8');
    });
  });

  it('should call correctly write the params in the db', async () => {
    await fetchVpnParameters();

    // params generated from the params to write
    const params = {
      // Params read from files
      staticIp: paramsToWrite.staticIp.data,
      ip: paramsToWrite.ip.data,
      psk: paramsToWrite.psk.data,
      name: paramsToWrite.name.data,
      internalIp: paramsToWrite.internalIp.data,
      externalIp: paramsToWrite.externalIp.data,
      publicIpResolved: true,
      // Params generated from previous params
      externalIpResolves: true,
      openPorts: true,
      upnpAvailable: true,
      initialized: true,
    };
    for (const key of (Object.keys(params))) {
      expect(await db.get(key)).to.equal(String(params[key]), `Wrong ${key}`);
    }
    /**
     * Sample db:
     *
     * { address: '0x19aBF633f7cba5D057c23...',
     *   domain: '19abf633f7cba5d0.dyn.test.io',
     *   externalIp: 'fakeExternalIp',
     *   externalIpResolves: 'true',
     *   initialized: 'true',
     *   internalIp: 'fakeInternalIp',
     *   ip: 'fakeIp',
     *   name: 'fakeName',
     *   openPorts: 'true',
     *   privateKey: '0x591c648c5d23...',
     *   psk: 'fakePsk',
     *   publicIpResolved: 'true',
     *   publicKey: 'e3b4f8fecbc7ca9fd79...',
     *   staticIp: '85.34.3.13',
     *   upnpAvailable: 'true' }
     */
  });

  it('should not refetch the staticIp from the installation file', async () => {
    await db.set('staticIp', '100.1.1.1');
    await fetchVpnParameters();
    expect(await db.get('staticIp')).to.equal('100.1.1.1');
  });

  it('should call log adminCredentials, and contain the static IP', async () => {
    const credentialsFile = require('../../src/utils/credentialsFile');
    const credentialsArray = [
      {name: 'SUPERadmin', password: 'MockPass2', ip: '172.33.10.1'},
    ];
    await credentialsFile.write(credentialsArray);
    const log = await logAdminCredentials();
    expect(log).to.include('100.1.1.1');
  });

  it('should call log adminCredentials, and contain the dyndns domain', async () => {
    await db.set('staticIp', null);
    const credentialsFile = require('../../src/utils/credentialsFile');
    const credentialsArray = [
      {name: 'SUPERadmin', password: 'MockPass2', ip: '172.33.10.1'},
    ];
    await credentialsFile.write(credentialsArray);
    const log = await logAdminCredentials();
    expect(log).to.include('.dyn.test.io');
  });

  after(() => {
    Object.keys(paramsToWrite).forEach((paramName) => {
      const param = paramsToWrite[paramName];
      fs.unlinkSync(param.path);
    });
    // Restart db
    try {
      fs.unlinkSync('./db.json');
    } catch (e) {
      //
    }
  });
});
