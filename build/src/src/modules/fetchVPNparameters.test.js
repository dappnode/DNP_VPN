const chai = require('chai');
const expect = require('chai').expect;
const fs = require('fs');
const fetchVPNparameters = require('./fetchVPNparameters');


chai.should();

describe('fetchVPNparameters test', function() {
  const paramsToWrite = {
    ip: {
      path: './test/ip',
      value: 'fakeIP',
    },
    psk: {
      path: './test/psk',
      value: 'fakePSK',
    },
    name: {
      path: './test/name',
      value: 'fakeNAME',
    },
    internalIp: {
      path: './test/internal-ip',
      value: 'fakeINT-IP',
    },
    externalIp: {
      path: './test/external-ip',
      value: 'fakeEXT-IP',
    },
    externalIpStatus: {
      path: './test/public-ip_resolved',
      value: {
        'EXT_IP': 'fakeEXT-IP',
        'INT_IP': 'fakeINT-IP',
        'attempts': 0,
        'externalIpResolves': undefined,
      },
      type: 'JSON',
    },
    upnpStatus: {
      path: './test/upnp_status',
      value: {
        'UPnP': true,
        'msg': 'UPnP device available',
        'openPorts': true,
      },
      type: 'JSON',
    },
  };

  let params = {};

  before(() => {
    // Create the files
    try {
      fs.mkdirSync('./test');
    } catch (e) {
      //
    }
    Object.keys(paramsToWrite).forEach((paramName) => {
      const param = paramsToWrite[paramName];
      fs.writeFileSync(param.path, param.value, 'utf8');
    });
  });

  it('should call fetchVPNparameters without crashing', async () => {
    params = await fetchVPNparameters();
  });

  it('read names should be correct and match each parameter', () => {
    Object.keys(params).forEach((paramName) => {
      if (paramsToWrite[paramName]) {
        if (paramsToWrite[paramName].type === 'JSON') {
          expect( params[paramName] ).to.deep.equal(
            paramsToWrite[paramName].value
          );
        } else {
          expect( params[paramName] ).to.equal( paramsToWrite[paramName].value );
        }
      }
    });
  });

  after(() => {
    Object.keys(paramsToWrite).forEach((paramName) => {
      const param = paramsToWrite[paramName];
      fs.unlinkSync(param.path);
    });
  });
});
