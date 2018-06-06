const chai = require('chai')

chai.should();

const credentialsFile = require('./credentialsFile')

describe('Util: credentialsFile', function() {

  const credentialsArray = [
    {
      name: 'SUPERadmin',
      password: 'MockPass2',
      ip: '172.33.10.1'
    },
    {
      name: 'MockName',
      password: 'MockPass',
      ip: '172.33.100.123'
    }
  ]

  it('should write the file', (done) => {
    credentialsFile.write(credentialsArray)
    .then(() => {
      done()
    })
  });

  it('should read the file', (done) => {
    credentialsFile.fetch()
    .then((credentialsArray_RES) => {
      credentialsArray_RES.should.deep.equal(credentialsArray)
      done()
    })

  });

});
