const fs = require("fs");
const { promisify } = require("util");
const readFileAsync = promisify(fs.readFile);
const logs = require("../logs.js")(module);
const ipRegex = require("ip-regex");

function getInstallationStaticIp() {
  const filePath = process.env.INSTALLATION_STATIC_IP;
  return (
    readFileAsync(filePath, "utf-8")
      .then(data => String(data).trim())
      // If the file is empty return null
      .then(data => (data.length ? data : null))
      .then(ip => {
        if (ipRegex({ exact: true }).test(ip)) return ip;
        else return null;
      })
      .catch(err => {
        if (err.code === "ENOENT") {
          logs.warn(
            `INSTALLATION_STATIC_IP file not found at ${filePath}: ${err.stack ||
              err.message}`
          );
        } else {
          logs.error(
            `Error reading INSTALLATION_STATIC_IP ${filePath}: ${err.stack ||
              err.message}`
          );
        }
        return null;
      })
  );
}

module.exports = getInstallationStaticIp;
