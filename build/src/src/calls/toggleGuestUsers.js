const credentialsFile = require('../utils/credentialsFile');
const generate = require('../utils/generate');
const db = require('../db');

const vpnPasswordLength = 20;
const guestsName = 'Guests';

async function toggleGuestUsers() {
    // Fetch devices data from the chap_secrets file
    let credentialsArray = await credentialsFile.fetch();
    const guestUsers = credentialsArray.find((u) => u.name === guestsName);
    if (guestUsers) {
        // Remove guest users credentials
        credentialsArray = credentialsArray.filter((u) => u.name !== guestsName);
    } else {
        // Use the previous password or create a new one
        let guestsPassword = db.get('guestsPassword');
        if (!guestsPassword) {
            guestsPassword = generate.password(vpnPasswordLength);
            db.set('guestsPassword', guestsPassword);
        }
        // Add guest users credentials
        credentialsArray.push({
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
