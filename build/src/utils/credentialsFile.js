const fs = require('file-system')


const CREDENTIALS_FILE_PATH = process.env.DEV ? './test/chap_secrets' : process.env.CREDENTIALS_FILE_PATH


function write(credentialsArray) {

  return new Promise(function(resolve, reject) {

    // Receives an array of credential objects, xl2tpd format
    const credentialsFileContent = chap_secretsFileFormat(credentialsArray)

    fs.writeFile(CREDENTIALS_FILE_PATH, credentialsFileContent, (err) => {
      if (err) throw err
      resolve()
    })

  })
}


function chap_secretsFileFormat(credentialsArray) {

  const chap_secretsLineFormat = (credentials) => {
    return '"'+credentials.name+'" l2tpd "'+credentials.password+'" '+credentials.ip
  }

  return credentialsArray
    .map(chap_secretsLineFormat)
    .join('\n')

}


function fetch() {

  return new Promise(function(resolve, reject) {

    fs.readFile(CREDENTIALS_FILE_PATH, 'utf-8', (err, fileContent) => {

      if (err) throw err

      // Split by line breaks
      let deviceCredentialsArray = fileContent.split(/\r?\n/)
      // Clean empty lines if any
      for (i = 0; i < deviceCredentialsArray.length; i++) {
        if (deviceCredentialsArray[i] == '') {
          deviceCredentialsArray.splice(i, 1)
        }
      }
      // Convert each line to an object + strip quotation marks
      let deviceCredentialsArrayParsed = deviceCredentialsArray.map(credentialsString => {
        let credentialsArray = credentialsString.split(' ')
        return {
          name: credentialsArray[0].replace(/['"]+/g, ''),
          password: credentialsArray[2].replace(/['"]+/g, ''),
          ip: credentialsArray[3]
        }
      })

      resolve(deviceCredentialsArrayParsed)

    })
  })
}


module.exports = {
  fetch,
  write
}
