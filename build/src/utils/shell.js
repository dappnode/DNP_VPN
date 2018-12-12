const util = require('util');
const exec = util.promisify(require('child_process').exec);

const timeout = 3*60*1000; // ms

function shell(cmd) {
    return exec(cmd, {timeout})
    .then((res) => res.stdout)
    .catch((err) => {
        if (err.signal === 'SIGTERM') {
            throw Error(`cmd "${err.cmd}" timed out (${timeout} ms)`);
        }
        throw err;
    });
}

module.exports = shell;
