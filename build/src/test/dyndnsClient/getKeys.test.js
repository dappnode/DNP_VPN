const expect = require('chai').expect;
const fs = require('file-system');
const util = require('util');
const logs = require('../../src/logs.js')(module);
const unlink = util.promisify(fs.unlink);
const proxyquire = require('proxyquire');

const testFoler = './mockFiles';
process.env.KEYPAIR_PATH = `${testFoler}/keypair`;
process.env.DYNDNS_HOST = 'dyn.test.io';

const dbResult = {};
const db = {
  set: (key, val) => ({
    write: () => {
      dbResult[key] = val;
    },
  }),
  get: (key) => ({
    value: () => dbResult[key],
  }),
};

const getKeys = proxyquire('../../src/dyndnsClient/getKeys', {
  '../db': db,
});

describe('Get keys function', function() {
  // Initialize calls

  let _res;

  describe('read non-existent file and create it', function() {
    before(async () => {
      // Clean files
      await unlink(process.env.KEYPAIR_PATH).catch((err) => {
        if (err.code !== 'ENOENT') {
          logs.error(err);
        }
      });
    });

    it('should return an identity object', async () => {
      _res = await getKeys(db);
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

    it('should have created the keypair object', async () => {
      const keypair = db.get('keypair').value();
      expect(keypair).to.an('object');
      ['address', 'domain', 'privateKey', 'publicKey'].forEach((key) => {
        expect(keypair).to.have.property(key);
      });
    });

    it('should return the same identity the second time ', async () => {
      const res = await getKeys(db);
      expect(res).to.deep.equal(_res);
    });

    after(async () => {
      // Clean files
      await unlink(process.env.KEYPAIR_PATH).catch((err) => {
        logs.error('\n\n\n', err, '\n\n\n');
      });
    });
  });
});
