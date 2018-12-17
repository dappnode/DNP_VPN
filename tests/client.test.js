const chai = require('chai');
const expect = require('chai').expect;
const calls = require('../calls');
const shell = require('../utils/shell')
const fs = require('fs');

chai.should();

describe('Integration test', function() {
  const id = 'Jordi';

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
  
    }
  });


  describe('Call function: createAddDevice', function() {
    let res;
    let user;

    it('should called addDevice without crashing', async () => {
      res = await addDevice({id});
    });

    it('should return success', () => {
      expect( res ).to.have.property('message');
    });

    it('user should actually exist', async () => {
      let res = await listDevices();
      user = res.result.find((d) => d.id == id);
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
        await addDevice({id});
      } catch (e) {
        error = e.message;
      }
      expect(error).to.equal('Device name exists: '+id);
    });
  });

  describe('Call function: toggleAdmin', function() {
    let res;
    let user;

    it('should call toggleAdmin without crashing', async () => {
      res = await toggleAdmin({id});
    });

    it('should return success', () => {
      expect( res ).to.have.property('message');
    });

    it('should still exist', async () => {
      let res = await listDevices();
      user = res.result.find((d) => d.id == id);
      expect( Boolean(user) ).to.be.true;
    });

    it('should have changed the user to admin IP', () => {
      let CcdFile = fs.existsSync(`/etc/openvpn/ccd/${user.id}`)
      expect( Boolean(CcdFile)).to.be.true;
    });
  });

  describe('Cannot remove an admin user', function() {
    it('should throw an error', async () => {
      let error = 'did not throw';
      try {
        await removeDevice({id});
      } catch (e) {
        error = e.message;
      }
      expect(error).to.equal('You cannot remove an admin user');
    });
  });

  describe('Undo admin', function() {
    let user;

    it('should call toggleAdmin without crashing', async () => {
      const res = await toggleAdmin({id});
      expect( res ).to.have.property('message');
    });

    it('should have changed the user without ccd', async () => {
      // Fetching devices
      let res = await listDevices();
      // Searching device
      user = res.result.find((d) => d.id == id);
      expect( Boolean(user) ).to.be.true;
      let CcdFile = fs.existsSync(`/etc/openvpn/ccd/${user.id}`)
      expect( Boolean(CcdFile)).to.be.false;
    });
  });

  describe('Call function: removeDevice', function() {
    let res;
    let user;

    it('should call removeDevice without crashing', async () => {
      res = await removeDevice({id});
    });

    it('should return success', () => {
      expect( res ).to.have.property('message');
    });

    it('should actually be deleted', async () => {
      let res = await listDevices();
      user = res.result.find((d) => d.id == id);
      expect( Boolean(user) ).to.be.false;
    });
  });
});
