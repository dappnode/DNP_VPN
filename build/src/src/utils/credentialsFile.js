const fs = require("fs");

const credentialsPath = process.env.DEV
  ? "./mockFiles/chap_secrets"
  : process.env.CREDENTIALS_PATH;

function write(credentialsArray) {
  // Receives an array of credential objects, xl2tpd format
  const credentialsFileContent = credentialsArray
    .map(
      credentials =>
        `"${credentials.name}" l2tpd "${credentials.password}" ${
          credentials.ip
        }`
    )
    .join("\n");
  fs.writeFileSync(credentialsPath, credentialsFileContent);
}

/**
 * @param {String} path
 * @return {Array} Array of objects:
 * [
 *   {
 *     name: 'guests',
 *     password: '7xg78agd87g3dkasd31',
 *     ip: '*'
 *   },
 *   ...
 * ]
 */
function fetch(path) {
  return (
    fs
      .readFileSync(path || credentialsPath, "utf-8")
      .trim()
      // Split by line breaks
      .split(/\r?\n/)
      // Ignore empty lines if any. Also, ignore faulty lines that start by "# " (observed many cases)
      .filter(line => line.trim() && !line.startsWith("# "))
      // Convert each line to an object + strip quotation marks
      .map(credentialsString => {
        let [name, , password, ip] = credentialsString
          .trim()
          .split(" ")
          .map(s => s.replace(/['"]+/g, ""));
        return { name, password, ip };
      })
  );
}

module.exports = {
  fetch,
  write
};
