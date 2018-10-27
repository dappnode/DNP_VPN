const fs = require('fs');
const {promisify} = require('util');
const generateLoginMsg = require('./generateLoginMsg');

/* eslint-disable no-console */

const loginMsgPath = process.env.LOGIN_MSG_PATH || './loginMsgFile.txt';

/**
 * @return {Bool} returns true if file exists, false if doesn't
 */
const exists = () => new Promise((resolve) => {
    fs.access(loginMsgPath, fs.constants.F_OK, (err) => {
        resolve(!err);
    });
});

const print = async () => {
    const loginMsg = await promisify(fs.readFile)(loginMsgPath);
    console.log(loginMsg);
};

const write = async () => {
    const loginMsg = await generateLoginMsg();
    await promisify(fs.writeFile)(loginMsgPath, loginMsg);
};

module.exports = {
    exists,
    print,
    write,
    path: loginMsgPath,
};

