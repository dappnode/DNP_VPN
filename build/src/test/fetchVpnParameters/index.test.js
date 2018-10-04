const chai = require('chai');
const expect = require('chai').expect;
const fs = require('fs');
const fetchVpnParameters = require('../../src/fetchVpnParameters');


chai.should();

describe('fetchVpnParameters test', function() {
  const paramsToWrite = {
    ip: {
      path: './mockFiles/ip',
      data: 'fakeIp',
    },
    psk: {
      path: './mockFiles/psk',
      data: 'fakePsk',
    },
    name: {
      path: './mockFiles/name',
      data: 'fakeName',
    },
    internalIp: {
      path: './mockFiles/internal-ip',
      data: 'fakeInternalIp',
    },
    externalIp: {
      path: './mockFiles/external-ip',
      data: 'fakeExternalIp',
    },
    publicIpResolved: {
      path: './mockFiles/public-ip-resolved',
      data: '1',
    },
  };

  let params = {};

  before(() => {
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

  it('should call fetchVpnParameters without crashing', async () => {
    params = await fetchVpnParameters();
  });

  it('the params object should be correct', () => {
    expect(params).to.deep.equal({
      ip: 'fakeIp',
      psk: 'fakePsk',
      internalIp: 'fakeInternalIp',
      externalIp: 'fakeExternalIp',
      publicIpResolved: true,
      name: 'fakeName',
      externalIpResolves: true,
      openPorts: true,
      upnpAvailable: true,
    });
  });

  after(() => {
    Object.keys(paramsToWrite).forEach((paramName) => {
      const param = paramsToWrite[paramName];
      fs.unlinkSync(param.path);
    });
  });
});
