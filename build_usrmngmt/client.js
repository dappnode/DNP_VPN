// Example WAMP client for AutobahnJS connecting to a Crossbar.io WAMP router.

// AutobahnJS, the WAMP client library to connect and talk to Crossbar.io:
var autobahn = require('autobahn');
var fs = require('file-system');

console.log("Running AutobahnJS " + autobahn.version);
// Produccion url: ws://my.wamp.dnp.dappnode.eth:8080/ws

// We read the connection parameters from the command line in this example:
const url = process.env.CBURL;
const realm = process.env.CBREALM;

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

   console.log("Connected: ", session, details);

   var componentId = details.authid;
   var componentType = "JavaScript/NodeJS";

   console.log("Component ID is ", componentId);
   console.log("Component tpye is ", componentType);


   // REGISTER a procedure for remote calling
   //
  function addDevice (args) {
    let newDeviceName = args[0];

    verifyDeviceUniqueness(newDeviceName)
    .then(generateCredentials)
    .then(addDeviceToCredentialsFile)
    .then(function(credentials) {
    console.log('Success: ',credentials)
    return {
       "result": "OK",
       "resultStr": "",
       "otp": credentials.otp,
       "id": credentials.id
     };
    })
    .catch(function(error) {
    console.log(error)
    return {
       "result": "ERR",
       "resultStr": error,
     };
    })
  }


  function removeDevice (args) {
    let deviceName = args[0];
    removeDeviceFromCredentialsFile(deviceName)
    .then(writeStringToCredentialsFile)
    .then(function() {
      console.log('Success removing: '+deviceName)
      return {
        "result": "OK",
        "resultStr": "",
      };
    })
    .catch(function(error) {
      console.log(error)
      return {
         "result": "ERR",
         "resultStr": error,
      };
    })
  }

  function listDevices (args) {
    fetchCredentialsFile()
    .then(function(deviceList) {
      console.log('Listing devices, current count: '+deviceList.length)
      return {
        "result": "OK",
        "resultStr": "",
        "devices": deviceList
      };
    })
    .catch(function(error) {
      console.log(error)
      return {
         "result": "ERR",
         "resultStr": error,
      };
    })
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

function verifyDeviceUniqueness(newDeviceName) {
  // Return new promise
  return new Promise(function(resolve, reject) {
    fs.readFile(credentialsFilename, 'utf-8', (err, fileContent) => {
      if (err) throw err;
      let deviceCredentialsArray = fileContent.split(/\r?\n/)
      deviceCredentialsArray.forEach(function(deviceCredentials) {
        let deviceName = deviceCredentials.split(' ')[0]
        if (deviceName == newDeviceName) {
          reject('Device name exists: '+newDeviceName);
        }
      });
      resolve(newDeviceName);
    });
  });
}

function generateCredentials(newDeviceName) {
  return new Promise(function(resolve, reject) {
    resolve({
      name: newDeviceName,
      password: 'sample_password',
      otp: 'sample_otp',
      id: 'sample_ID'
    })
  });
}

function addDeviceToCredentialsFile(credentials) {
  return new Promise(function(resolve, reject) {
    let newData = '"'+credentials.name+'" l2tpd "'+credentials.password+'" *\n';
    fs.appendFile(credentialsFilename, newData, function(err){
      if (err) reject('ERROR')
      else resolve(credentials)
    });
  });
}

function removeDeviceFromCredentialsFile(_deviceName) {
  // Return new promise
  return new Promise(function(resolve, reject) {
    let deviceNameFound = false;
    fs.readFile(credentialsFilename, 'utf-8', (err, fileContent) => {
      if (err) throw err;
      let deviceCredentialsArray = fileContent.split(/\r?\n/)
      for (i = 0; i < deviceCredentialsArray.length; i++) {
        let deviceCredentials = deviceCredentialsArray[i];
        let deviceName = deviceCredentials.split(' ')[0];
        if (deviceName == _deviceName) {
          deviceNameFound = true;
          deviceCredentialsArray.splice(i, 1);
        }
      }
      if (deviceNameFound) {
        let newCredentialsFileString = deviceCredentialsArray.join('\n')
        resolve(newCredentialsFileString);
      } else {
        reject('Device not found: '+_deviceName);
      }
    });
  });
}

function writeStringToCredentialsFile(string) {
  // Return new promise
  return new Promise(function(resolve, reject) {
    fs.writeFile(credentialsFilename, string, (err) => {
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
          name: credentialsArray[0],
          password: credentialsArray[2]
        }
      });
      resolve(deviceCredentialsArrayParsed);
    });
  });
}
