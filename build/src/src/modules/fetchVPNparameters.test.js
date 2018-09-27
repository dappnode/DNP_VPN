const chai = require('chai');
const expect = require('chai').expect;
const fs = require('fs');
const fetchVPNparameters = require('./fetchVPNparameters');


chai.should();

describe('fetchVPNparameters test', function() {
  const paramsToWrite = {
    IP: {
      path: './test/ip',
      value: 'fakeIP',
    },
    PSK: {
      path: './test/psk',
      value: 'fakePSK',
    },
    NAME: {
      path: './test/name',
      value: 'fakeNAME',
    },
    INT_IP: {
      path: './test/internal-ip',
      value: 'fakeINT-IP',
    },
    EXT_IP: {
      path: './test/external-ip',
      value: 'fakeEXT-IP',
    },
    EXTERNALIP_STATUS: {
      path: './test/public-ip_resolved',
      value: {
        'EXT_IP': 'fakeEXT-IP',
        'INT_IP': 'fakeINT-IP',
        'attempts': 0,
        'externalIpResolves': undefined,
      },
      type: 'JSON',
    },
    UPNP_STATUS: {
      path: './test/upnp_status',
      value: {
        'UPnP': true,
        'msg': 'UPnP device available',
        'openPorts': true,
      },
      type: 'JSON',
    },
  };

  Object.keys(paramsToWrite).forEach((paramName) => {
    const param = paramsToWrite[paramName];
    fs.writeFileSync(param.path, param.value, 'utf8');
  });

  const params = {};

  it('should call fetchVPNparameters without crashing', async () => {
    params.VPN = await fetchVPNparameters();
  });

  it('read names should be correct and match each parameter', () => {
    Object.keys(params.VPN).forEach((paramName) => {
      if (paramsToWrite[paramName]) {
        if (paramsToWrite[paramName].type === 'JSON') {
          expect( params.VPN[paramName] ).to.deep.equal(
            paramsToWrite[paramName].value
          );
        } else {
          expect( params.VPN[paramName] ).to.equal( paramsToWrite[paramName].value );
        }
      }
    });
  });
});
