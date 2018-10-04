const chai = require('chai');
const expect = require('chai').expect;
const getKeys = require('../../src/dyndnsClient/getKeys');
const fs = require('file-system');
const util = require('util');
const logs = require('../../src/logs.js')(module);

const unlink = util.promisify(fs.unlink);

chai.should();

const KEYPAIR_PATH = './mockFiles/keypair';

describe('Get keys function', function() {
  // Initialize calls

  let _res;

  describe('read non-existent file and create it', function() {
    before(async () => {
      // Clean files
      await unlink(KEYPAIR_PATH).catch((err) => {
        if (err.code !== 'ENOENT') {
          logs.error('\n\n\n', err, '\n\n\n');
        }
      });
    });

    it('should return an identity object', async () => {
      _res = await getKeys();
      expect(_res).to.be.an('Object');
      expect(_res).to.have.property('address');
      expect(_res).to.have.property('domain');
      expect(_res).to.have.property('privateKey');
    });

    it('should contain a correct domain', async () => {
      // Check that the domain is correct
      const {domain, address} = _res;
      const [subdomain, ...host] = domain.split('.');
      expect(address.toLowerCase()).to.include(subdomain);
      expect(host.join('.')).to.equal('dyn.test.io');
    });

    it('should have created the keypair file', async () => {
      expect(fs.existsSync(KEYPAIR_PATH)).to.be.true;
    });

    it('should return the same identity the second time ', async () => {
      const res = await getKeys();
      expect(res).to.deep.equal(_res);
    });

    after(async () => {
      // Clean files
      await unlink(KEYPAIR_PATH).catch((err) => {
        logs.error('\n\n\n', err, '\n\n\n');
      });
    });
  });
});
