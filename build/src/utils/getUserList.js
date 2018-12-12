const shell = require('./shell');

// bash-4.4# ovpn_listclients 
// name,begin,end,status
// dappnode_admin,Nov 21 14:00:04 2018 GMT,Nov 18 14:00:04 2028 GMT,VALID
// luser,Nov 23 14:00:49 2018 GMT,Nov 20 14:00:49 2028 GMT,VALID
// revoked,Nov 23 14:02:38 2018 GMT,Nov 20 14:02:38 2028 GMT,REVOKED

const ovpnListCommand = '/usr/local/bin/ovpn_listclients'
// const listCommand = 'cat ./userlist';

async function fetch() {
  output = await shell(listCommand);
  users = []
  // Select users from first field which are not revoked.
  output.toString().split('\n').filter((elem) => ! (elem.startsWith('name,') || elem.endsWith('REVOKED'))).map(element => { 
    users.push(element.split(',')[0]);
  });
  return users
}

module.exports = fetch;