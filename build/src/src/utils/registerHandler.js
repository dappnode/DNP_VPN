const logs = require('../logs.js')(module);

function registerHandler(session, event, handler) {
    const wrapErrors = (handler) =>
        async function(args, kwargs) {
        // 0. args: an array with call arguments
        // 1. kwargs: an object with call arguments
        // 2. details: an object which provides call metadata

        // Construct logger. The dappmanager stores the logs
        // and forwards them to the ADMIN UI
        const logToDappmanager = (log) => {
            session.publish('logUserActionToDappmanager', [log]);
        };

        try {
            const res = await handler(kwargs);

            // Log result
            logToDappmanager({level: 'info', event, ...res, kwargs});
            const eventShort = event.replace('.vpn.dnp.dappnode.eth', '');
            if (res.logMessage) {
                logs.info('Result of '+eventShort+': '+res.message);
            }
            return JSON.stringify({
                success: true,
                message: res.message || event,
                result: res.result || {},
            });
        } catch (err) {
            logToDappmanager({level: 'error', event, ...error2obj(err), kwargs});
            logs.error('Event: '+event+', Error: '+err);
            return JSON.stringify({
                success: false,
                message: err.message,
            });
        }
    };
    return session.register(event, wrapErrors(handler)).then(
        (reg) => {logs.info('CROSSBAR: registered '+event);},
        (err) => {logs.error('CROSSBAR: error registering '+event+'. Error message: '+err.error);}
    );
}

const error2obj = (e) => ({name: e.name, message: e.message, stack: e.stack, userAction: true});

module.exports = registerHandler;
