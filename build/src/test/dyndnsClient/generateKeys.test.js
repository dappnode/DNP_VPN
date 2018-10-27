const expect = require('chai').expect;
const fs = require('file-system');
const util = require('util');
const logs = require('../../src/logs.js')(module);
const unlink = util.promisify(fs.unlink);
const db = require('../../src/db');

process.env.DYNDNS_DOMAIN = 'dyn.test.io';

const generateKeys = require('../../src/dyndnsClient/generateKeys');

describe('generateKeys', function() {
  // Initialize calls

  let _res;

  describe('read non-existent file and create it', function() {
    before(async () => {
      // Restart db
      try {
        fs.unlinkSync('./db.json');
      } catch (e) {
        //
      }
    });

    it('should return an identity object', async () => {
      await generateKeys();
      _res = Object.assign({}, await db.get('keypair'));
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

    it('should return the same identity the second time ', async () => {
      await generateKeys();
      expect(await db.get('keypair')).to.deep.equal(_res);
    });

    after(async () => {
      // Restart db
      try {
        fs.unlinkSync('./db.json');
      } catch (e) {
        //
      }
      // Clean files
      await unlink(process.env.KEYPAIR_PATH).catch((err) => {
        logs.error('\n\n\n', err, '\n\n\n');
      });
    });
  });
});
