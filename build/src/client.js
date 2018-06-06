const autobahn = require('autobahn')
const fs = require('file-system')
const generator = require('generate-password')
const base64url = require('base64url')
const createError = require('create-error')
const qrcode = require('qrcode-terminal')

const URL = 'ws://my.wamp.dnp.dappnode.eth:8080/ws'
const REALM = 'dappnode_admin'
const DAPPNODE_OTP_URL = process.env.DAPPNODE_OTP_URL
const VPN_IP_FILE_PATH = process.env.VPN_IP_FILE_PATH
const VPN_PSK_FILE_PATH = process.env.VPN_PSK_FILE_PATH
const VPN_NAME_FILE_PATH = process.env.VPN_NAME_FILE_PATH
const CREDENTIALS_FILE_PATH = '/etc/ppp/chap-secrets'
const COMPONENT_TYPE = 'JavaScript/NodeJS'

const VPN_PASSWORD_LENGTH = 20

const COMMON_STATIC_IP_PREFIX = '172.33.'
const USER_STATIC_IP_PREFIX = '172.33.100.'
const ADMIN_STATIC_IP_PREFIX = '172.33.10.'
const MASTER_ADMIN_IP = '172.33.10.1'
const USER_STATIC_IP_FIRST_OCTET = 2
const USER_STATIC_IP_LAST_OCTET = 250

let VPN_IP
let VPN_PSK
let VPN_NAME

const VPNError = createError('MyCustomError');

start()

async function start () {

  console.log('Waiting for credentials files to exist')
  await fetchVPNparameters()
  console.log('VPN credentials fetched, VPN_IP: ' + VPN_IP + ' VPN_PSK: ' + VPN_PSK)

  logAdminCredentials(VPN_IP, VPN_PSK)

  connection.open()
  console.log('Attempting to connect to.... \n'
    +'   url: '+connection._options.url+'\n'
    +'   realm: '+connection._options.realm)

}


///////////////////////////////
// Setup crossbar connection //
///////////////////////////////


const connection = new autobahn.Connection({ url: URL, realm: REALM })
const SUCCESS_MESSAGE = '---------------------- \n procedure registered'
const ERROR_MESSAGE = '------------------------------ \n failed to register procedure '

connection.onopen = function (session, details) {

   console.log('Successfully connected to '+URL
    +'\n  Component ID:   '+details.authid
    +'\n  Component type: '+COMPONENT_TYPE)

   session.register('ping.vpn.dnp.dappnode.eth', x => x).then(
      function (reg) { console.log(SUCCESS_MESSAGE) },
      function (err) { console.log(ERROR_MESSAGE, err) }
   )
   session.register('addDevice.vpn.dnp.dappnode.eth', addDevice).then(
      function (reg) { console.log(SUCCESS_MESSAGE) },
      function (err) { console.log(ERROR_MESSAGE, err) }
   )
   session.register('removeDevice.vpn.dnp.dappnode.eth', removeDevice).then(
      function (reg) { console.log(SUCCESS_MESSAGE) },
      function (err) { console.log(ERROR_MESSAGE, err) }
   )
   session.register('toggleAdmin.vpn.dnp.dappnode.eth', toggleAdmin).then(
      function (reg) { console.log(SUCCESS_MESSAGE) },
      function (err) { console.log(ERROR_MESSAGE, err) }
   )
   session.register('listDevices.vpn.dnp.dappnode.eth', listDevices).then(
      function (reg) { console.log(SUCCESS_MESSAGE) },
      function (err) { console.log(ERROR_MESSAGE, err) }
   )

}

connection.onclose = function (reason, details) {

   console.log('Connection lost: ' + reason)

}


////////////////////
// Define methods //
////////////////////


async function addDevice (args) {

  let newDeviceName = args[0]

  try {

    // Fetch devices data from the chap_secrets file
    let credentialsArray = await fetchCredentialsFile(CREDENTIALS_FILE_PATH)
    let deviceNamesArray = credentialsArray.map(credentials => credentials.name)
    let deviceIPsArray = credentialsArray.map(credentials => credentials.ip)

    // Check if device name is unique
    if (deviceNamesArray.includes(newDeviceName)) {
      throw new VPNError('Device name exists: '+newDeviceName)
    }

    // Generate credentials
    let ip = await generateDeviceIP(deviceIPsArray)
    let password = generateDevicePassword(VPN_PASSWORD_LENGTH)

    // Append credentials to the chap_secrets file
    credentialsArray.push({
      name: newDeviceName,
      password: password,
      ip: ip
    })
    await writeCredentialsFile(credentialsArray)

    return JSON.stringify({
      success: true,
      message: 'Added device '+newDeviceName,
      result: {}
    })

  } catch(e) {

    console.log(e)
    return JSON.stringify({
      success: false,
      message: e.message
    })

  }
}


async function removeDevice (args) {

  let deviceName = args[0]

  try {

    // Fetch devices data from the chap_secrets file
    let credentialsArray = await fetchCredentialsFile(CREDENTIALS_FILE_PATH)

    // Do not allow the user to remove all

    // Find the requested name in the device object array
    // if found: splice the device's object,
    // else: throw error
    let deviceNameFound = false
    for (i = 0; i < credentialsArray.length; i++) {
      if (deviceName == credentialsArray[i].name) {

        // Prevent the user from deleting admins
        if (credentialsArray[i].ip.includes(ADMIN_STATIC_IP_PREFIX)) {
          throw new VPNError('You cannot remove an admin user')

        } else {
          deviceNameFound = true
          credentialsArray.splice(i, 1)
        }
      }
    }

    // Write back the device object array
    // Log results to the UI
    if (deviceNameFound) {
      await writeCredentialsFile(credentialsArray)
      return JSON.stringify({
        success: true,
        message: 'Removed device '+deviceName,
        result: {}
      })
    } else {
      throw new VPNError('Device name does not exist: '+deviceName)
    }

  } catch(e) {

    console.log(e)
    return JSON.stringify({
      success: false,
      message: e.message
    })

  }
}


async function toggleAdmin (args) {

  let deviceName = args[0]

  try {

    // Fetch devices data from the chap_secrets file
    let credentialsArray = await fetchCredentialsFile(CREDENTIALS_FILE_PATH)

    // Do not allow the user to remove all

    // Find the requested name in the device object array
    // if found: splice the device's object,
    // else: throw error
    let deviceNameFound = false
    let isAdmin
    for (i = 0; i < credentialsArray.length; i++) {
      if (deviceName == credentialsArray[i].name) {

        // Prevent the user from deleting admins
        if (credentialsArray[i].ip.includes(MASTER_ADMIN_IP)) {
          throw new VPNError('You cannot remove the master admin user')

        } else if (credentialsArray[i].ip.includes(ADMIN_STATIC_IP_PREFIX)) {
          isAdmin = true
          credentialsArray[i].ip.replace(ADMIN_STATIC_IP_PREFIX, USER_STATIC_IP_PREFIX)

        } else if (credentialsArray[i].ip.includes(USER_STATIC_IP_PREFIX)) {
          credentialsArray[i].ip.replace(USER_STATIC_IP_PREFIX, ADMIN_STATIC_IP_PREFIX)
        }
        // Raise found flag
        deviceNameFound = true
      }
    }

    // Write back the device object array
    // Log results to the UI
    if (deviceNameFound) {
      await writeCredentialsFile(credentialsArray)
      return JSON.stringify({
        success: true,
        message: (isAdmin) ? ('removed admin credentials from '+deviceName) : ('given admin credentials to '+deviceName),
        result: {}
      })
    } else {
      throw new VPNError('Device name does not exist: '+deviceName)
    }

  } catch(e) {

    console.log(e)
    return JSON.stringify({
      success: false,
      message: e.message
    })

  }
}


async function listDevices (args) {

  try {

    // Fetch devices data from the chap_secrets file
    let deviceList = await fetchCredentialsFile(CREDENTIALS_FILE_PATH)
    deviceList.forEach(function(credentials) {
      credentials.otp = generateDeviceOTP(credentials.name, credentials.password, VPN_IP, VPN_PSK)
    })

    console.log('Listing devices, current count: '+deviceList.length)
    return JSON.stringify({
      success: true,
      message: 'Listed devices',
      result: deviceList
    })

  } catch(e) {

    console.log(e)
    return JSON.stringify({
      success: false,
      message: e.message
    })

  }
}


//////////////////////
// Helper functions //
//////////////////////


function writeCredentialsFile(credentialsArray) {

  return new Promise(function(resolve, reject) {

    // Receives an array of credential objects, xl2tpd format
    const credentialsFileContent = chap_secretsFileFormat(credentialsArray)

    fs.writeFile(CREDENTIALS_FILE_PATH, credentialsFileContent, (err) => {
      if (err) throw err
      resolve()
    })

  })
}


function chap_secretsFileFormat(credentialsArray) {

  const chap_secretsLineFormat = (credentials) => {
    return '"'+credentials.name+'" l2tpd "'+credentials.password+'" '+credentials.ip
  }

  return credentialsArray
    .map(chap_secretsLineFormat)
    .join('\n')

}


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

function generateDeviceIP(deviceIPsArray) {

  const ipPrefix = COMMON_STATIC_IP_PREFIX
  const firstOctet = USER_STATIC_IP_FIRST_OCTET
  const lastOctet = USER_STATIC_IP_LAST_OCTET

  // Get the list of used octets
  let usedIpOctets = deviceIPsArray.reduce((usedIpOctets, ip) => {
    if (ip.includes(ipPrefix)) {
      let octetArray = ip.trim().split('.')
      let endingOctet = octetArray[octetArray.length - 1]
      usedIpOctets.push(parseFloat(endingOctet))
    }
    return usedIpOctets
  }, [])
  // Compute a consecutive list of integers from firstOctet to lastOctet
  let possibleIpOctets = fillRange(firstOctet, lastOctet)
  // Compute the available octets by computing the difference
  let availableOctets = possibleIpOctets.diff( usedIpOctets )
  // Alert the user if there are no available octets
  if (availableOctets.length < 1) {
    throw new VPNError('No available IP addresses. Consider deleting old or unused devices')
  }
  // Chose the smallest available octet
  let chosenOctet = Math.min.apply(null, availableOctets)

  return ipPrefix+chosenOctet

}


function generateDevicePassword(passwordLength) {

  return generator.generate({
    length: passwordLength,
    numbers: true
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

  // Show the QR code
  qrcode.setErrorLevel('S');
  qrcode.generate(adminOtp);

  // Show credentials
  console.log(`
To connect to your DAppNode scan the QR above, copy/paste link below into your browser or use VPN credentials:

${adminOtp}

 VPN-Type         IP               PSK                name             password
L2TP/IPSec  ${VPN_IP}  ${VPN_PSK}  ${adminDevice.name}  ${adminDevice.password}`)

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


///////////////////////
// Utility functions //
///////////////////////


Array.prototype.diff = function(a) {

    return this.filter(function(i) {return a.indexOf(i) < 0})

}


const fillRange = (start, end) => {

  return Array(end - start + 1).fill().map((item, index) => start + index)

}
