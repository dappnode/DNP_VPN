const proxyquire = require('proxyquire');
const chai = require('chai');
const expect = require('chai').expect;
const sinon = require('sinon');

chai.should();

describe('Call function: listDevices', function() {
    // This function calls getUserList and getCCD to build
    // a list of objects with id and admin boolean
    const userList = ['dappnode_admin', 'mobile', 'guest', 'tom'];
    const ccdList = [{cn: 'dappnode_admin', ip: '172.33.0.1'},
                    {cn: 'tom', ip: '172.33.0.2'}];
    const userResult = [{id: 'dappnode_admin', admin: true},
                        {id: 'mobile', admin: false},
                        {id: 'guest', admin: false},
                        {id: 'tom', admin: true}];
    // sinon.replace(,));   <--- to replace an inside function
    const getUserList = sinon.stub();
    getUserList.resolves(userList);
    const getCCD = sinon.stub();
    getCCD.resolves(ccdList);
    const listDevices = proxyquire('../../calls/listDevices', {
        '../utils/getUserList': getUserList,
        '../utils/getCCD': getCCD,
    });

    it('should return success message and the users array', async () => {
        let res = await listDevices();
        expect( res ).to.have.property('message');
        expect( res ).to.have.property('result');
        expect( res.result ).to.be.an('array');
        expect( res.result ).to.deep.equal(userResult);
    });
});
