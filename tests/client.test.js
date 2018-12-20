const chai = require('chai');
const expect = require('chai').expect;
const calls = require('../calls');
const shell = require('../utils/shell')
const fs = require('fs');

chai.should();

describe('Integration test', function() {
  const ids = ['Jordi','Hal','Wardog'];

  // Initialize calls
  const {addDevice, removeDevice, toggleAdmin, listDevices} = calls;

  // Create config files
  before(async () => {
  
    try {
       await shell('ovpn_genconfig -c -d -u udp://test -s 172.33.8.0/23');
       await shell('EASYRSA_REQ_CN=test ovpn_initpki nopass');
       await shell('easyrsa build-client-full dappnode_admin nopass');
       await shell('easyrsa build-client-full luser nopass');
      } catch (e) {
        throw Error(`Cannot initalize: ${e}`);
    }
  });


  describe('Call function: createAddDevice', function() {
    let res;
    let user;

    it('should called addDevice without crashing', async () => {
      res = await addDevice({id: ids[0] });
    });

    it('should return success', () => {
      expect( res ).to.have.property('message');
    });

    it('user should actually exist', async () => {
      let res = await listDevices();
      user = res.result.find((d) => d.id == ids[0]);
      expect( Boolean(user) ).to.be.true;
    });

    it('should have created a user without admin rights: without ccd file.', () => {
      let CcdFile = fs.existsSync(`/etc/openvpn/ccd/${user.id}`)
      expect( Boolean(CcdFile)).to.be.false;
    });
  });

  describe('Cannot create a user with the same name', function() {
    it('should throw an error', async () => {
      let error = 'did not throw';
      try {
        await addDevice({id: ids[0]});
      } catch (e) {
        error = e.message;
      }
      expect(error).to.equal('Device name exists: '+ids[0]);
    });
  });

  describe('Call function: toggleAdmin', function() {
    let res;
    let user;

    it('should call toggleAdmin without crashing', async () => {
      res = await toggleAdmin({id: ids[0]});
    });

    it('should return success', () => {
      expect( res ).to.have.property('message');
    });

    it('should still exist', async () => {
      let res = await listDevices();
      user = res.result.find((d) => d.id == ids[0]);
      expect( Boolean(user) ).to.be.true;
    });

    it('should have changed the user to admin', () => {
      let CcdFile = fs.existsSync(`/etc/openvpn/ccd/${user.id}`)
      expect( Boolean(CcdFile)).to.be.true;
    });
  });

  describe('Cannot remove an admin user', function() {
    it('should throw an error', async () => {
      let error = 'did not throw';
      try {
        await removeDevice({id: ids[0]});
      } catch (e) {
        error = e.message;
      }
      expect(error).to.equal('You cannot remove an admin user');
    });
  });

  describe('Undo admin', function() {
    let user;

    it('should call toggleAdmin without crashing', async () => {
      const res = await toggleAdmin({id: ids[0]});
      expect( res ).to.have.property('message');
    });

    it('should have changed the user without ccd', async () => {
      // Fetching devices
      let res = await listDevices();
      // Searching device
      user = res.result.find((d) => d.id == ids[0]);
      expect( Boolean(user) ).to.be.true;
      let CcdFile = fs.existsSync(`/etc/openvpn/ccd/${user.id}`)
      expect( Boolean(CcdFile)).to.be.false;
    });
  });

  describe('Add a couple of admins', function(){
    let user1
    let user2
    it('should called addDevice for first user without crashing', async () => {
      res = await addDevice({id: ids[1] });
    });
    it('should return success', () => {
      expect( res ).to.have.property('message');
    });

    it('should called addDevice for second user without crashing', async () => {
      res = await addDevice({id: ids[2] });
    });
    it('should return success', () => {
      expect( res ).to.have.property('message');
    });

    it('should call toggleAdmin to the first user without crashing', async () => {
      res = await toggleAdmin({id: ids[1]});
    });

    it('should return success', () => {
      expect( res ).to.have.property('message');
    });

    it('should call toggleAdmin to the second user without crashing', async () => {
      res = await toggleAdmin({id: ids[2]});
    });

    it('should return success', () => {
      expect( res ).to.have.property('message');
    });

    it('should have changed the first user to admin', () => {
      let CcdFile = fs.existsSync(`/etc/openvpn/ccd/${ids[1]}`)
      expect( Boolean(CcdFile)).to.be.true;
    });

    it('should have changed the second user to admin', () => {
      let CcdFile = fs.existsSync(`/etc/openvpn/ccd/${ids[2]}`)
      expect( Boolean(CcdFile)).to.be.true;
    });

    it('should call toggleAdmin to the first user without crashing', async () => {
      res = await toggleAdmin({id: ids[1]});
    });

    it('should return success', () => {
      expect( res ).to.have.property('message');
    });

    it('should have changed the first user to non admin', () => {
      let CcdFile = fs.existsSync(`/etc/openvpn/ccd/${ids[1]}`)
      expect( Boolean(CcdFile)).to.be.false;
    });

  });

  describe('Call function: removeDevice', function() {
    let res;
    let user;

    it('should call removeDevice without crashing', async () => {
      res = await removeDevice({id: ids[0]});
    });

    it('should return success', () => {
      expect( res ).to.have.property('message');
    });

    it('should actually be deleted', async () => {
      let res = await listDevices();
      user = res.result.find((d) => d.id == ids[0]);
      expect( Boolean(user) ).to.be.false;
    });
  });
});
