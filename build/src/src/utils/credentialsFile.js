const fs = require('file-system');


const credentialsPath =
  process.env.DEV ? './mockFiles/chap_secrets' : process.env.CREDENTIALS_PATH;


async function write(credentialsArray) {
  // Receives an array of credential objects, xl2tpd format
  const credentialsFileContent = chapSecretsFileFormat(credentialsArray);

  fs.writeFileSync(credentialsPath, credentialsFileContent);
}


function chapSecretsFileFormat(credentialsArray) {
  return credentialsArray
    .map((credentials) =>
      `"${credentials.name}" l2tpd "${credentials.password}" ${credentials.ip}`)
    .join('\n');
}

/**
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
async function fetch() {
  const fileContent = await fs.readFileSync(credentialsPath, 'utf-8');

  // Split by line breaks
  let deviceCredentialsArray = fileContent.trim().split(/\r?\n/);

  // Convert each line to an object + strip quotation marks
  return deviceCredentialsArray
  .filter(((line) => {
    // Ignore empty lines if any
    if (line === '') return false;
    if (line.startsWith('# ')) return false;
    return true;
  }))
  .map((credentialsString) => {
    let credentialsArray = credentialsString.trim().split(' ');
    return {
      name: credentialsArray[0].replace(/['"]+/g, ''),
      password: credentialsArray[2].replace(/['"]+/g, ''),
      ip: credentialsArray[3],
    };
  });
}


module.exports = {
  fetch,
  write,
};
