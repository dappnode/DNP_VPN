const fs = require('fs');
const path = require('path');
const ip = require('ip');

//const ccdPath = './ccd'
const ccdPath = '/etc/openvpn/ccd';
const ipRange = ['172.33.10.1','172.33.10.250']

async function fetch() {
  var ccdlist = [];
  await fs.readdirSync(ccdPath).forEach( async function(filename) {
    var filepath = path.join(ccdPath, filename);
    var stats = fs.statSync(filepath);
    if (!stats.isDirectory()) {
      var data = await fs.readFileSync(filepath, 'utf-8');
      var fixedip = data.trim().split(' ')[1];
      if (ip.isV4Format(fixedip)) {
        ccdlist.push({ cn: filename, ip: fixedip});
      } else {
        console.log(`WARNING: Invalid IP detected at ccd: ${filename}`)
      };
    } 
  });
  return ccdlist;
};

function lowestIP(ccdList) {
  lowest = ip.toLong(ipRange[0])
  ccdList.sort((a,b) => ip.toLong(a.ip) - ip.toLong(b.ip)).every( (item) => {
      if (ip.toLong(item.ip) > lowest) {
        return false;
      }
      else {
        lowest++;
        return true;
      }
    }
  );
  if (lowest > ip.toLong(ipRange[1])) {
    throw Error("Maximum admin users reached.");
  }
  return ip.fromLong(lowest);
};

module.exports = {
    fetch,
    lowestIP
};

// fetchCCD().then( (list) => console.log(lowestIP(list)));
