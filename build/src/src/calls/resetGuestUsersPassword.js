const credentialsFile = require('../utils/credentialsFile');
const generate = require('../utils/generate');
const {eventBus, eventBusTag} = require('../eventBus');
const db = require('../db');

const vpnPasswordLength = 20;
const guestsName = 'Guests';

async function resetGuestUsersPassword() {
    // Fetch devices data from the chap_secrets file
    let credentialsArray = credentialsFile.fetch();

    const guestsPassword = generate.password(vpnPasswordLength);
    await db.set('guestsPassword', guestsPassword);

    const guestUsers = credentialsArray.find((u) => u.name === guestsName);
    if (guestUsers) {
        guestUsers.password = guestsPassword;
        credentialsFile.write(credentialsArray);
    }

    // Emit packages update
    eventBus.emit(eventBusTag.emitDevices);

    return {
        message: `Reseted guests password`,
        logMessage: true,
        userAction: true,
    };
}


module.exports = resetGuestUsersPassword;
