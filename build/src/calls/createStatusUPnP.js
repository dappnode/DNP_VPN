const res = require('../utils/res')
const exec = require('child_process').exec;

function createStatusUPnP(params) {

  return async function addDevice (args) {

    // Check availability of UPnP
    const VPN = params.VPN;
    if (!("IP" in VPN && "EXT_IP" in VPN && "INT_IP" in VPN)) {
      throw Error('Necessary credentials not found in params object')
    }

    const status = getStatus(VPN)
    const externalIpResolves = checkHost(VPN.EXT_IP)

    return res.success('UPnP status ', status)

  }
}


const getStatus = VPN => {
  const { IP, EXT_IP, INT_IP } = VPN;

  if (EXT_IP && EXT_IP.length) return ({
    openPorts: true,
    UPnP: true,
    msg: 'UPnP device available'
  })

  else if (
    INT_IP && INT_IP.length 
    && IP && IP.length 
    && INT_IP === IP
  ) return ({
    openPorts: false,
    UPnP: true,
    msg: 'Cloud service'
  })

  else return ({
    openPorts: true,
    UPnP: false,
    msg: 'UPnP not available. Turn it on or open ports manually'
  })
}

const ping = (host, method) => {
    return new Promise((resolve, reject) => {
        let cmd;
        if (method == 'ping') cmd = 'ping -c 10 '+host
        if (method == 'nc') cmd = 'nc -vzu '+host+' 500'
        exec(cmd, (error) => {
            if (error) return reject(error)
            return resolve()
        });
    })
}

const checkHost = async (host) => {
  for (i=0; i<10; i++) {
    let res = await ping(host, 'nc').then(() => true, () => false)
    if (res) return true
  } 
  return false
}


module.exports = createStatusUPnP
