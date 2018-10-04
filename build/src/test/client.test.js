const chai = require('chai');
const expect = require('chai').expect;
const createAddDevice = require('../src/calls/createAddDevice');
const createListDevices = require('../src/calls/createListDevices');
const createRemoveDevice = require('../src/calls/createRemoveDevice');
const createToggleAdmin = require('../src/calls/createToggleAdmin');

const credentialsFile = require('../src/utils/credentialsFile');
const generate = require('../src/utils/generate');
const fs = require('fs');

chai.should();

describe('Integration test', function() {
  const id = 'Jordi';

  const params = {
    ip: '88.88.88.88',
    psk: 'PSKfake',
    name: 'FakeDAppNode',
  };

  // Initialize calls
  const getParams = () => params;
  const addDevice = createAddDevice(credentialsFile, generate);
  const removeDevice = createRemoveDevice(credentialsFile);
  const toggleAdmin = createToggleAdmin(credentialsFile);
  const listDevices = createListDevices(credentialsFile, generate, getParams);

  // Create file
  before(() => {
    // Create the files
    try {
      fs.mkdirSync('./mockFiles');
    } catch (e) {
      //
    }
    fs.writeFileSync('./mockFiles/chap_secrets', '', 'utf8');
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

    it('should actually write in the chap-secrets file', async () => {
      let res = await listDevices();
      user = res.result.find((d) => d.name == id);
      expect( Boolean(user) ).to.be.true;
    });

    it('should have created a user without admin IP', () => {
      let ipArray = user.ip.trim().split('.');
      expect( String(ipArray[2]) ).to.equal(String(100));
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

    it('should actually write in the chap-secrets file', async () => {
      let res = await listDevices();
      user = res.result.find((d) => d.name == id);
      expect( Boolean(user) ).to.be.true;
    });

    it('should have changed the user to admin IP', () => {
      let ipArray = user.ip.trim().split('.');
      expect( String(ipArray[2]) ).to.equal(String(10));
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

    it('should have changed the user to user IP', async () => {
      // Fetching devices
      let res = await listDevices();
      // Searching device
      user = res.result.find((d) => d.name == id);
      expect( Boolean(user) ).to.be.true;
      // Verifying the ip range
      let ipArray = user.ip.trim().split('.');
      expect( String(ipArray[2]) ).to.equal(String(100));
    });
  });

  describe('Call function: removeDevice', function() {
    let res;
    let user;

    it('should call toggleAdmin without crashing', async () => {
      res = await removeDevice({id});
    });

    it('should return success', () => {
      expect( res ).to.have.property('message');
    });

    it('should actually write in the chap-secrets file', async () => {
      let res = await listDevices();
      user = res.result.find((d) => d.name == id);
      expect( Boolean(user) ).to.be.false;
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
