const credentialsFile = require('../utils/credentialsFile');
const generate = require('../utils/generate');
const db = require('../db');

const vpnPasswordLength = 20;
const guestsName = 'guests';

async function toggleGuestUsers() {
    // Fetch devices data from the chap_secrets file
    let credentialsArray = await credentialsFile.fetch();
    const guestUsers = credentialsArray.find((u) => u.name === guestsName);
    if (guestUsers) {
        // Remove guest users credentials
        credentialsArray = credentialsArray.filter((u) => u.name !== guestsName);
    } else {
        // Use the previous password or create a new one
        let guestsPassword = db.get('guestsPassword').value();
        if (!guestsPassword) {
            guestsPassword = generate.password(vpnPasswordLength);
            db.set('guestsPassword', guestsPassword).write();
        }
        // Add guest users credentials
        credentialsArray.unshift({
            name: guestsName,
            password: guestsPassword,
            ip: '*',
        });
    }

    await credentialsFile.write(credentialsArray);

    return {
        message: `${guestUsers ? 'disabled' : 'enabled'} guests users`,
        logMessage: true,
        userAction: true,
    };
}


module.exports = toggleGuestUsers;
