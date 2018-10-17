const credentialsFile = require('../utils/credentialsFile');
const generate = require('../utils/generate');
const db = require('../db');

const vpnPasswordLength = 20;
const guestsName = 'Guests';

async function resetGuestUsersPassword() {
    // Fetch devices data from the chap_secrets file
    let credentialsArray = await credentialsFile.fetch();

    const guestsPassword = generate.password(vpnPasswordLength);
    db.set('guestsPassword', guestsPassword).write();

    const guestUsers = credentialsArray.find((u) => u.name === guestsName);
    if (guestUsers) {
        guestUsers.password = guestsPassword;
        await credentialsFile.write(credentialsArray);
    }

    return {
        message: `Reseted guests password`,
        logMessage: true,
        userAction: true,
    };
}


module.exports = resetGuestUsersPassword;
