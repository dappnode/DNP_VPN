const db = require('../db');
const dyndnsClient = require('../dyndnsClient');

async function setStaticIp({staticIp}) {
    const oldStaticIp = db.get('staticIp').value();
    db.set('staticIp', staticIp).write();

    // Parse action to display a feedback message
    let message;
    if (!oldStaticIp && staticIp) {
        message = `Enabled static IP: ${staticIp}`;
    } else if (oldStaticIp && !staticIp) {
        message = `Disabled static IP`;
        // If the staticIp is being disabled but there is no keypair: register to dyndns
        if (!db.get('keypair').value()) {
            await dyndnsClient.updateIp();
            message += `, and registered to dyndns: ${db.get('domain').value()}`;
        }
    } else {
        message = `Updated static IP: ${staticIp}`;
    }

    return {
      message,
      logMessage: true,
      userAction: true,
    };
}


module.exports = setStaticIp;
