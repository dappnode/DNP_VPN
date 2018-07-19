const chai = require('chai')
const expect = require('chai').expect
const sinon = require('sinon')
const fs = require('fs')
const createAddDevice = require('./createAddDevice')
const createListDevices = require('./createListDevices')
const createRemoveDevice = require('./createRemoveDevice')
const createToggleAdmin = require('./createToggleAdmin')

const credentialsFile = require('../utils/credentialsFile')
const generate = require('../utils/generate')

chai.should();

describe('Integration test', function() {

  const USER_NAME = 'Jordi'

  const params = {
    VPN: {
      ip: '88.88.88.88',
      psk: 'PSKfake',
      name: 'FakeDAppNode'
    }
  }

  // Initialize calls
  const addDevice = createAddDevice(credentialsFile, generate)
  const removeDevice = createRemoveDevice(credentialsFile)
  const toggleAdmin = createToggleAdmin(credentialsFile)
  const listDevices = createListDevices(credentialsFile, generate, params)

  describe('Call function: createAddDevice', function() {

    let unparsedRes
    let user

    it('should called addDevice without crashing', async () => {
      unparsedRes = await addDevice({id: USER_NAME})
    })

    it('should return success', () => {
      let res = JSON.parse(unparsedRes)
      expect( res.success ).to.be.true
    })

    it('should actually write in the chap-secrets file', async () => {
      let res = JSON.parse(await listDevices())
      user = res.result.find(d => d.name == USER_NAME)
      expect( Boolean(user) ).to.be.true
    })

    it('should have created a user without admin IP', () => {
      let ipArray = user.ip.trim().split('.')
      expect( String(ipArray[2]) ).to.equal(String(100))
    })

  })

  describe('Cannot create a user with the same name', function() {

    it('should throw an error', async () => {
      let error = 'did not throw'
      try {
        await addDevice({id: USER_NAME})
      } catch(e) {
        error = e.message
      }
      expect(error).to.equal('Device name exists: '+USER_NAME)
    })

  })

  describe('Call function: toggleAdmin', function() {

    let unparsedRes
    let user

    it('should call toggleAdmin without crashing', async () => {
      unparsedRes = await toggleAdmin({id: USER_NAME})
    })

    it('should return success', () => {

      let res = JSON.parse(unparsedRes)
      expect( res.success ).to.be.true
    })

    it('should actually write in the chap-secrets file', async () => {
      let res = JSON.parse(await listDevices())
      user = res.result.find(d => d.name == USER_NAME)
      expect( Boolean(user) ).to.be.true
    })

    it('should have changed the user to admin IP', () => {
      let ipArray = user.ip.trim().split('.')
      expect( String(ipArray[2]) ).to.equal(String(10))
    })

  })

  describe('Cannot remove an admin user', function() {

    it('should throw an error', async () => {
      let error = 'did not throw'
      try {
        await removeDevice({id: USER_NAME})
      } catch(e) {
        error = e.message
      }
      expect(error).to.equal('You cannot remove an admin user')
    })

  })

  describe('Undo admin', function() {

    let user

    it('should call toggleAdmin without crashing', async () => {
      unparsedRes = await toggleAdmin({id: USER_NAME})
      expect( JSON.parse(unparsedRes).success ).to.be.true
    })

    it('should have changed the user to user IP', async () => {
      // Fetching devices
      let res = JSON.parse(await listDevices())
      // Searching device
      user = res.result.find(d => d.name == USER_NAME)
      expect( Boolean(user) ).to.be.true
      // Verifying the ip range
      let ipArray = user.ip.trim().split('.')
      expect( String(ipArray[2]) ).to.equal(String(100))
    })

  })

  describe('Call function: removeDevice', function() {

    let unparsedRes
    let user

    it('should call toggleAdmin without crashing', async () => {
      unparsedRes = await removeDevice({id: USER_NAME})
    })

    it('should return success', () => {
      let res = JSON.parse(unparsedRes)
      expect( res.success ).to.be.true
    })

    it('should actually write in the chap-secrets file', async () => {
      let res = JSON.parse(await listDevices())
      user = res.result.find(d => d.name == USER_NAME)
      expect( Boolean(user) ).to.be.false
    })

  })

});
