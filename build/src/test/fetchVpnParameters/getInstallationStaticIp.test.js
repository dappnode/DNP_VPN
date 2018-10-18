const chai = require('chai');
const expect = require('chai').expect;
const fs = require('fs');

chai.should();

const testFoler = './mockFiles';
process.env.INSTALLATION_STATIC_IP = `${testFoler}/staticIp`;

const getInstallationStaticIp = require('../../src/fetchVpnParameters/getInstallationStaticIp');

describe('Util: getInstallationStaticIp', function() {
  before(() => {
    try {
        fs.mkdirSync(testFoler);
      } catch (e) {
        //
      }
  });

  it('should return null if the file is missing', async () => {
    const staticIp = await getInstallationStaticIp();
    expect(staticIp).to.equal(null);
  });

  it('should return null if the file is empty', async () => {
    fs.writeFileSync(process.env.INSTALLATION_STATIC_IP, '');
    const staticIp = await getInstallationStaticIp();
    expect(staticIp).to.equal(null);
  });

  it('should return null if the ip is incorrect', async () => {
    fs.writeFileSync(process.env.INSTALLATION_STATIC_IP, '333.45.43.1111');
    const staticIp = await getInstallationStaticIp();
    expect(staticIp).to.equal(null);
  });

  it('should return the ip if the ip is valid', async () => {
    fs.writeFileSync(process.env.INSTALLATION_STATIC_IP, '85.4.52.53');
    const staticIp = await getInstallationStaticIp();
    expect(staticIp).to.equal('85.4.52.53');
  });

  after(() => {
    try {
      fs.unlinkSync(process.env.INSTALLATION_STATIC_IP);
    } catch (e) {
      //
    }
    try {
      fs.rmdirSync(testFoler);
    } catch (e) {
      //
    }
  });
});
