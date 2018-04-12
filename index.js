// Example WAMP client for AutobahnJS connecting to a Crossbar.io WAMP router.

// AutobahnJS, the WAMP client library to connect and talk to Crossbar.io:
var autobahn = require('autobahn');

console.log("Running AutobahnJS " + autobahn.version);

// We read the connection parameters from the command line in this example:
const url =  'ws://192.168.1.37:9000/ws';
const realm = 'realm1';

// Make us a new connection ..
var connection = new autobahn.Connection({
    url: url,
    realm: realm
});

// timers
//
var t1, t2;


// fired when connection is established and session attached
//
connection.onopen = function (session, details) {

    console.log("Connected: ", session, details);

    var componentId = details.authid;
    var componentType = "JavaScript/NodeJS";

    console.log("Component ID is ", componentId);
    console.log("Component tpye is ", componentType);

    session.call('installPackage.installer.dnp.dappnode.eth', ['rinkeby.dnp.dappnode.eth@0.0.1']).then(

        function (res) {
            console.log(res)
            var arr_from_json = JSON.parse(res);

            console.log('-----------------------');
            console.log('result:', arr_from_json.result);
            console.log('resultStr:', arr_from_json.resultStr);

        },

        function (err) {
            console.log("-----------------------");
            console.log("installPackage.installer.dnp.dappnode.eth error:", err);
        }

    );
};


// fired when connection was lost (or could not be established)
//
connection.onclose = function (reason, details) {

    console.log("Connection lost: " + reason);

    clearInterval(t1);
    t1 = null;

    clearInterval(t2);
    t2 = null;

}


// now actually open the connection
//
connection.open();