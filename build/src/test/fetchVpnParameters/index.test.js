const chai = require('chai');
const expect = require('chai').expect;
const fs = require('fs');
const db = require('../../src/db');


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
const getKeys = require('../../src/dyndnsClient/getKeys');
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
    expect(db.getState()).to.deep.equal({
      ip: 'fakeIp',
      psk: 'fakePsk',
      internalIp: 'fakeInternalIp',
      externalIp: 'fakeExternalIp',
      publicIpResolved: true,
      name: 'fakeName',
      externalIpResolves: true,
      openPorts: true,
      upnpAvailable: true,
      staticIp: '85.34.3.13',
      initialized: true,
    });
    expect(db.getState().keypair).to.equal(undefined);
    expect(db.getState().domain).to.equal(undefined);
  });

  it('should not refetch the staticIp from the installation file', async () => {
    db.set('staticIp', '100.1.1.1').write();
    await fetchVpnParameters();
    expect(db.getState()).to.deep.include({
      staticIp: '100.1.1.1',
    });
  });

  it('should call log adminCredentials', async () => {
    const credentialsFile = require('../../src/utils/credentialsFile');
    const credentialsArray = [
      {name: 'SUPERadmin', password: 'MockPass2', ip: '172.33.10.1'},
    ];
    await credentialsFile.write(credentialsArray);
    const log = await logAdminCredentials();
    expect(log).to.include('100.1.1.1');
  });

  it('should get a new keypair if there is no staticIp', async () => {
    db.set('staticIp', null).write();
    await fetchVpnParameters();
    // Deep clone. Calling getKeys() will generate keys if there weren't
    const currentDb = JSON.parse(JSON.stringify(db.getState()));
    expect(currentDb).to.deep.equal({
      ip: 'fakeIp',
      psk: 'fakePsk',
      internalIp: 'fakeInternalIp',
      externalIp: 'fakeExternalIp',
      publicIpResolved: true,
      name: 'fakeName',
      externalIpResolves: true,
      openPorts: true,
      upnpAvailable: true,
      staticIp: null,
      initialized: true,
      keypair: getKeys(),
      domain: getKeys().domain,
    });
  });

  it('should call log adminCredentials', async () => {
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
