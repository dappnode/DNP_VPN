const db = require('../db');

async function setStaticIp({ip}) {
    const oldIp = db.get('ip').value();
    db.set('ip', ip).write();

    // Parse action to display a feedback message
    let message;
    if (!oldIp && ip) {
        message = `Enabled static IP: ${ip}`;
    } else if (oldIp && !ip) {
        message = `Disabled static IP`;
    } else {
        message = `Updated static IP: ${ip}`;
    }

    return {
      message,
      logMessage: true,
      userAction: true,
    };
}


module.exports = setStaticIp;
