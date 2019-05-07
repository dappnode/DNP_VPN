const fs = require("file-system");
const { promisify } = require("util");
const readFileAsync = promisify(fs.readFile);
const logs = require("../logs.js")(module);

const serverNamePath = process.env.SERVER_NAME_PATH;
const defaultName = "DAppNode_server";

function getServerName() {
  return readFileAsync(serverNamePath, "utf-8")
    .then(data => String(data).trim() || defaultName)
    .catch(e => {
      if (e.code === "ENOENT") {
        logs.warn(
          `Server name file not found at ${serverNamePath}: ${e.stack ||
            e.message}`
        );
      } else {
        logs.error(
          `Error reading server name file at ${serverNamePath}: ${e.stack ||
            e.message}`
        );
      }
      return defaultName;
    });
}

module.exports = getServerName;
