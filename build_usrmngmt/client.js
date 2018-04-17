// Example WAMP client for AutobahnJS connecting to a Crossbar.io WAMP router.

// AutobahnJS, the WAMP client library to connect and talk to Crossbar.io:
var autobahn = require('autobahn');
var fs = require('file-system');
var generator = require('generate-password');
var base64url = require('base64url')

console.log("Running AutobahnJS " + autobahn.version);
// Produccion url: ws://my.wamp.dnp.dappnode.eth:8080/ws

// We read the connection parameters from the command line in this example:
const url = process.env.CBURL;
const realm = process.env.CBREALM;
var SERVER_IP;
var SERVER_PSK;
var SERVER_IP_FILE = '/etc/server-ip';
var SERVER_PSK_FILE = '/etc/server-psk';

console.log("connecting to.... \n   url: "+url+"\n   realm: "+realm)

const credentialsFilename = '/etc/ppp/chap-secrets'

// Make us a new connection ..
var connection = new autobahn.Connection({
   url: url,
   realm: realm
});
let session;


// fired when connection is established and session attached
//
connection.onopen = function (session, details) {

   console.log("Connected!!! ");

   var componentId = details.authid;
   var componentType = "JavaScript/NodeJS";

   console.log("Component ID is ", componentId);
   console.log("Component tpye is ", componentType);


   // REGISTER a procedure for remote calling
   //
  async function addDevice (args) {
    let newDeviceName = args[0];
    try {
      // Fetch data from the chap_secrets file
      let credentialsArray = await fetchCredentialsFile();
      let deviceNamesArray = credentialsArray.map(credentials => credentials.name)
      let deviceIPsArray = credentialsArray.map(credentials => credentials.ip)
      // Check if device name is unique
      if (deviceNamesArray.includes(newDeviceName)) {
        throw 'Device name exists: '+newDeviceName;
      }
      // Generate credentials
      let ip = await generateDeviceIP(deviceIPsArray)
      let password = await generateDevicePassword()
      let serverIP = await fetchServerIP()
      let serverPSK = await fetchServerPSK()
      let otp = await generateDeviceOTP(newDeviceName, password, serverIP, serverPSK)
      let credentials = {
        name: newDeviceName,
        password: password,
        ip: ip,
        otp: otp
      }
      // Appending credentials to the chap_secrets file
      credentialsArray.push(credentials)
      await writeCredentialsFile(credentialsArray);
      console.log('Success adding device:'+
        ' NAME: '+credentials.name+
        ' PASS: '+credentials.password+
        ' IP: '+credentials.ip+
        ' OTP: '+credentials.otp
      )
      return {
        "result": "OK",
        "resultStr": ""
      };
    } catch(e) {
      console.log(e)
      return {
         "result": "ERR",
         "resultStr": JSON.stringify(e)
      };
    }
  }

  async function removeDevice (args) {
    let deviceName = args[0];
    try {
      let credentialsArray = await fetchCredentialsFile();
      let deviceNameFound = false;
      for (i = 0; i < credentialsArray.length; i++) {
        if (deviceName == credentialsArray[i].name) {
          deviceNameFound = true;
          credentialsArray.splice(i, 1);
        }
      }
      if (deviceNameFound) {
        await writeCredentialsFile(credentialsArray);
        return {
          "result": "OK",
          "resultStr": ""
        };
      } else {
        throw 'Device name does not exist: '+deviceName;
      }
    } catch(e) {
      console.log(e)
      return {
         "result": "ERR",
         "resultStr": JSON.stringify(e)
      };
    }
  }

  async function listDevices (args) {
    let deviceList = await fetchCredentialsFile()
    console.log('Listing devices, current count: '+deviceList.length)
    return {
      "result": "OK",
      "resultStr": "",
      "devices": deviceList
    };
  }

   // We register this as a shared registration, i.e. multiple
   // registrations for the same procedure URI are possible.
   // With "roundrobin" these are invoked in turn by Crossbar.io
   // on calls to the procedure URI.

   /* ********** */
   /*  DEVICES   */
   /* ********** */

   session.register('addDevice.vpn.repo.dappnode.eth', addDevice, { invoke: "roundrobin"}).then(
      function (reg) {
         console.log("-----------------------");
         console.log('procedure registered');
      },
      function (err) {
         console.log("-----------------------");
         console.log('failed to register procedure', err);
      }
   );
   session.register('removeDevice.vpn.repo.dappnode.eth', removeDevice, { invoke: "roundrobin"}).then(
      function (reg) {
         console.log("-----------------------");
         console.log('procedure registered');
      },
      function (err) {
         console.log("-----------------------");
         console.log('failed to register procedure', err);
      }
   );
   session.register('listDevices.vpn.repo.dappnode.eth', listDevices, { invoke: "roundrobin"}).then(
      function (reg) {
         console.log("-----------------------");
         console.log('procedure registered');
      },
      function (err) {
         console.log("-----------------------");
         console.log('failed to register procedure', err);
      }
   );

};


// fired when connection was lost (or could not be established)
//
connection.onclose = function (reason, details) {

   console.log("Connection lost: " + reason);

}


// now actually open the connection
//
connection.open();



// Helper functions
//

function writeCredentialsFile(credentialsArray) {
  // Return new promise
  return new Promise(function(resolve, reject) {
    let credentialsArrayString = credentialsArray.map(credentials => {
      return '"'+credentials.name+'" l2tpd "'+credentials.password+'" '+credentials.ip;
    })
    let credentialsFileString = credentialsArrayString.join('\n')
    fs.writeFile(credentialsFilename, credentialsFileString, (err) => {
      if (err) throw err;
      resolve();
    });
  });
}

function fetchCredentialsFile() {
  return new Promise(function(resolve, reject) {
    fs.readFile(credentialsFilename, 'utf-8', (err, fileContent) => {
      if (err) throw err;
      let deviceCredentialsArray = fileContent.split(/\r?\n/)
      // Clean empty lines if any
      for (i = 0; i < deviceCredentialsArray.length; i++) {
        if (deviceCredentialsArray[i] == '') {
          deviceCredentialsArray.splice(i, 1);
        }
      }
      // Convert each line to an object
      let deviceCredentialsArrayParsed = deviceCredentialsArray.map(credentialsString => {
        let credentialsArray = credentialsString.split(' ');
        return {
          name: credentialsArray[0].replace(/['"]+/g, ''),
          password: credentialsArray[2].replace(/['"]+/g, ''),
          ip: credentialsArray[3]
        }
      });
      resolve(deviceCredentialsArrayParsed);
    });
  });
}

function generateDeviceIP(deviceIPsArray) {
  let ipPrefix = '192.168.44.';
  let firstOctet = 2;
  let lastOctet = 250;
  return new Promise(function(resolve, reject) {
    // Get the list of used octets
    let usedIpOctets = deviceIPsArray.reduce((usedIpOctets, ip) => {
      if (ip.includes(ipPrefix)) {
        usedIpOctets.push(parseFloat(ip.split(ipPrefix)[1]));
      }
      return usedIpOctets;
    }, []);
    // Compute a consecutive list of integers from firstOctet to lastOctet
    let possibleIpOctets = fillRange(firstOctet, lastOctet);
    // Compute the available octets by computing the difference
    let availableOctets = possibleIpOctets.diff( usedIpOctets );
    // Alert the user if there are no available octets
    if (availableOctets.length < 1) {
      throw 'No available IP addresses. Consider deleting old or unused devices';
    }
    // Chose the smallest available octet
    let chosenOctet = Math.min.apply(null, availableOctets)
    resolve( ipPrefix+chosenOctet )
  });
}

function generateDevicePassword() {
  return new Promise(function(resolve, reject) {
    let password = generator.generate({
      length: 20,
      numbers: true
    });
    resolve(password)
  });
}

function generateDeviceOTP(deviceName, password, serverIP, serverPSK) {
  return new Promise(function(resolve, reject) {
    let DAppNode_OTP = 'https://dappnode.github.io/DNP_VPN/DAppNode_OTP.html';
    let otpCredentials = {
      "server": serverIP,
      "name": "DAppNode-Server",
      "user": deviceName,
      "pass": password,
      "psk": serverPSK
    };
    let otpCredentialsEncoded = base64url.encode(JSON.stringify(otpCredentials));
    let url = DAppNode_OTP + '#otp=' + otpCredentialsEncoded;
    resolve(url)
  });
}

function fetchServerIP() {
  return new Promise(function(resolve, reject) {
    fs.readFile(SERVER_IP_FILE, 'utf-8', (err, fileContent) => {
      if (err) throw err;
      let serverIP = String(fileContent).trim()
      console.log('#### SERVER-IP: '+serverIP)
      resolve(serverIP)
    });
  });
}

function fetchServerPSK() {
  return new Promise(function(resolve, reject) {
    fs.readFile(SERVER_PSK_FILE, 'utf-8', (err, fileContent) => {
      if (err) throw err;
      let serverPSK = String(fileContent).trim()
      console.log('#### SERVER-PSK: '+serverPSK)
      resolve(serverPSK)
    });
  });
}

// Utility tools
Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};

const fillRange = (start, end) => {
  return Array(end - start + 1).fill().map((item, index) => start + index);
};
