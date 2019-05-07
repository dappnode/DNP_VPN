const fs = require("fs");
const { promisify } = require("util");
const generateLoginMsg = require("./generateLoginMsg");

/* eslint-disable no-console */

const loginMsgPath = process.env.LOGIN_MSG_PATH || "./loginMsgFile.txt";

const write = async url => {
  const loginMsg = await generateLoginMsg(url);
  await promisify(fs.writeFile)(loginMsgPath, loginMsg, "utf8");
  return loginMsg; // return for testing
};

module.exports = {
  write,
  generate: generateLoginMsg,
  path: loginMsgPath // necessary for cleaning in testing
};
