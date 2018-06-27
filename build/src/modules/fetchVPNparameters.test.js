const chai = require('chai')
const expect = require('chai').expect
const sinon = require('sinon')
const fs = require('fs')
const fetchVPNparameters = require('./fetchVPNparameters')


chai.should();

describe('fetchVPNparameters test', function() {

  paramsToWrite = {
    IP: { path: './test/ip', value: 'fakeIP' },
    PSK: { path: './test/psk', value: 'fakePSK' },
    NAME: { path: './test/name', value: 'fakeNAME' },
    INT_IP: { path: './test/internal-ip', value: 'fakeINT-IP' },
    EXT_IP: { path: './test/external-ip', value: 'fakeEXT-IP' }
  }

  Object.keys(paramsToWrite).forEach(paramName => {
    const param = paramsToWrite[paramName]
    fs.writeFileSync(param.path, param.value, 'utf8')
  })

  const params = {}

  it('should called addDevice without crashing', async () => {
    params.VPN = await fetchVPNparameters()
  })

  it('read names should be correct and match each parameter', () => {
    Object.keys(params.VPN).forEach(paramName => {
      expect( params.VPN[paramName] ).to.equal( paramsToWrite[paramName].value )
    })
  })

});
