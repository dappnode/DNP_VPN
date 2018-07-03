const res = require('../utils/res')
const exec = require('child_process').exec;

function createStatusExternalIp(params) {

  return async function statusExternalIp () {

    // Check availability of UPnP
    await runUpnpScript()
    const VPN = await fetchVPNparameters()
    params.VPN = VPN
    if (!("IP" in VPN && "EXT_IP" in VPN && "INT_IP" in VPN)) {
      throw Error('Necessary credentials not found in params object')
    }

    const externalIpResolves = checkHost(VPN.EXT_IP)

    return res.success('External IP status ', {externalIpResolves})

  }
}

const checkHost = async (host) => {
  for (i=0; i<10; i++) {
    let res = await ping(host, 'ping').then(() => true, () => false)
    if (res) return true
  } 
  return false
}

const ping = (host, method) => {
    return new Promise((resolve, reject) => {
        let cmd;
        if (method == 'ping') cmd = 'ping -c 20 '+host
        if (method == 'nc') cmd = 'nc -vzu '+host+' 500'
        exec(cmd, (error) => {
            if (error) return reject(error)
            return resolve()
        });
    })
}

module.exports = createStatusExternalIp
