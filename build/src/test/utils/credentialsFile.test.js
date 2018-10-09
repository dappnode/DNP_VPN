const chai = require('chai');
const fs = require('fs');

chai.should();

const credentialsFile = require('../../src/utils/credentialsFile');

describe('Util: credentialsFile', function() {
  const credentialsArray = [
    {
      name: 'SUPERadmin',
      password: 'MockPass2',
      ip: '172.33.10.1',
    },
    {
      name: 'MockName',
      password: 'MockPass',
      ip: '172.33.100.123',
    },
  ];

  it('should write the file', (done) => {
    credentialsFile.write(credentialsArray)
    .then(() => {
      done();
    });
  });

  it('should read the file', (done) => {
    credentialsFile.fetch()
    .then((credentialsArrayRes) => {
      credentialsArrayRes.should.deep.equal(credentialsArray);
      done();
    });
  });

  after(() => {
    try {
      fs.unlinkSync('./mockFiles/chap_secrets');
    } catch (e) {
      //
    }
    try {
      fs.rmdirSync('./mockFiles');
    } catch (e) {
      //
    }
  });
});
