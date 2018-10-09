const db = require('../db');

async function setStaticIp({staticIp}) {
    const oldStaticIp = db.get('staticIp').value();
    db.set('staticIp', staticIp).write();

    // Parse action to display a feedback message
    let message;
    if (!oldStaticIp && staticIp) {
        message = `Enabled static IP: ${staticIp}`;
    } else if (oldStaticIp && !staticIp) {
        message = `Disabled static IP`;
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
