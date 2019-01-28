const expect = require('chai').expect;
const proxyquire = require('proxyquire');

// Purpose of the test
// Fake wget responses and ensure the custom control flow works
describe('Util: getPublicIp', () => {
  it('should return the static IP', async () => {
    const getPublicIp = proxyquire('../../src/utils/getPublicIp', {
        './getStaticIp': async () => '1.1.1.1',
        './getExternalIp': async () => '2.2.2.2',
        './getPublicIpFromUrls': async () => '3.3.3.3',
    });
    const _ip = await getPublicIp();
    expect(_ip).to.equal('1.1.1.1');
  });

  it('should return the external IP', async () => {
    const getPublicIp = proxyquire('../../src/utils/getPublicIp', {
        './getStaticIp': async () => '',
        './getExternalIp': async () => '2.2.2.2',
        './getPublicIpFromUrls': async () => '',
    });
    const _ip = await getPublicIp();
    expect(_ip).to.equal('2.2.2.2');
  });

  it('should return the public obtained IP', async () => {
    const getPublicIp = proxyquire('../../src/utils/getPublicIp', {
        './getStaticIp': async () => '',
        './getExternalIp': async () => {
            throw Error('Some error getting external IP');
        },
        './getPublicIpFromUrls': async () => '3.3.3.3',
    });
    const _ip = await getPublicIp();
    expect(_ip).to.equal('3.3.3.3');
  });
});
