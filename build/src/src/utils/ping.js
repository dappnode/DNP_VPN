const shell = require("./shell");

// Usage:
// const resolved = await ping('83.53.19.120')
// > will return true / false

const count = 5;
const max = 3;

/**
 * Checks if a given IP resolves
 *
 * @param {String} ip
 * @return {Boolean} resolves
 */
async function ping(ip) {
  let i = 0;
  while (i++ < max) {
    // The command ping returns code 0 if some package was successful
    // The command ping returns code != 0 if no package was successful
    const resolved = await shell(`ping -c ${count} ${ip}`)
      .then(() => true)
      .catch(() => false);
    if (resolved) return true;
  }
  return false;
}

module.exports = ping;
