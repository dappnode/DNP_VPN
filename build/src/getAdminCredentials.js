#!/usr/bin/env node

const autobahn = require('autobahn')
const fs = require('file-system')
const base64url = require('base64url')

const url = process.env.CBURL
const realm = process.env.CBREALM
const DAPPNODE_OTP_URL = process.env.DAPPNODE_OTP_URL
const VPN_IP_FILE_PATH = process.env.VPN_IP_FILE_PATH
const VPN_PSK_FILE_PATH = process.env.VPN_PSK_FILE_PATH
const VPN_NAME_FILE_PATH = process.env.VPN_NAME_FILE_PATH
const CREDENTIALS_FILE_PATH = '/etc/ppp/chap-secrets'

let VPN_IP
let VPN_PSK
let VPN_NAME

start()

async function start () {

  console.log('Waiting for credentials files to exist')
  await fetchVPNparameters()
  console.log('VPN credentials fetched, VPN_IP: ' + VPN_IP + ' VPN_PSK: ' + VPN_PSK)

  logAdminCredentials(VPN_IP, VPN_PSK)

}


//////////////////////
// Helper functions //
//////////////////////


function fetchCredentialsFile(CREDENTIALS_FILE_PATH) {

  return new Promise(function(resolve, reject) {

    fs.readFile(CREDENTIALS_FILE_PATH, 'utf-8', (err, fileContent) => {

      if (err) throw err

      // Split by line breaks
      let deviceCredentialsArray = fileContent.split(/\r?\n/)
      // Clean empty lines if any
      for (i = 0; i < deviceCredentialsArray.length; i++) {
        if (deviceCredentialsArray[i] == '') {
          deviceCredentialsArray.splice(i, 1)
        }
      }
      // Convert each line to an object + strip quotation marks
      let deviceCredentialsArrayParsed = deviceCredentialsArray.map(credentialsString => {
        let credentialsArray = credentialsString.split(' ')
        return {
          name: credentialsArray[0].replace(/['"]+/g, ''),
          password: credentialsArray[2].replace(/['"]+/g, ''),
          ip: credentialsArray[3]
        }
      })

      resolve(deviceCredentialsArrayParsed)

    })
  })
}


function generateDeviceOTP(deviceName, password, VPN_IP, VPN_PSK) {

    let otpCredentials = {
      'server': VPN_IP,
      'name': VPN_NAME,
      'user': deviceName,
      'pass': password,
      'psk': VPN_PSK
    }

    let otpCredentialsEncoded = base64url.encode(JSON.stringify(otpCredentials))
    return DAPPNODE_OTP_URL + '#otp=' + otpCredentialsEncoded

}


async function logAdminCredentials(VPN_IP, VPN_PSK) {

  let deviceList = await fetchCredentialsFile(CREDENTIALS_FILE_PATH)
  let adminDevice = deviceList[0]
  let adminOtp = generateDeviceOTP(adminDevice.name, adminDevice.password, VPN_IP, VPN_PSK)

  // Prepare output
  let output = ''
  + '\n'
  + 'Connect to your new DAppNode following this link:' + '\n'
  + '\n'
  + adminOtp + '\n'
  + '\n'
  + 'or use your VPN credentials' + '\n'
  + '\n'
  + 'VPN type  : ' + 'L2TP/IPSec' + '\n'
  + 'Server IP : ' + VPN_IP + '\n'
  + 'PSK       : ' + VPN_PSK + '\n'
  + 'name      : ' + adminDevice.name + '\n'
  + 'password  : ' + adminDevice.password + '\n'
  + '\n'

  console.log(output)

}


async function fetchVPNparameters() {

  await fileToExist(VPN_IP_FILE_PATH)
  await fileToExist(VPN_PSK_FILE_PATH)

  VPN_IP = await fetchVPN_PARAMETER(VPN_IP_FILE_PATH)
  VPN_PSK = await fetchVPN_PARAMETER(VPN_PSK_FILE_PATH)

  // The existence of this file is not crucial to the system
  // It it doesn't exist fallback to a default name
  if (fs.existsSync(VPN_NAME_FILE_PATH)) {
    VPN_NAME = await fetchVPN_PARAMETER(VPN_NAME_FILE_PATH)
  } else {
    VPN_NAME = 'DAppNode_server'
  }

}


function pauseSync(ms) {
  return new Promise(function(resolve, reject) {
    setTimeout(function(){
      resolve()
    }, ms);
  })
}


function fileToExist(FILE_PATH) {

  let maxAttempts = 120;

  return new Promise(async function(resolve, reject) {
    for (let i = 0; i < maxAttempts; i++) {
      if (fs.existsSync(FILE_PATH)) {
        return resolve()
      }
      await pauseSync(500)
    }
    throw 'File not existent after #' + maxAttempts + ' attempts, path: ' + FILE_PATH
  })

}


function fetchVPN_PARAMETER(VPN_PARAMETER_FILE_PATH) {

  return new Promise(function(resolve, reject) {

    fs.readFile(VPN_PARAMETER_FILE_PATH, 'utf-8', (err, fileContent) => {
      if (err) throw err
      let VPN_PARAMETER = String(fileContent).trim()
      resolve(VPN_PARAMETER)
    })

  })
}
