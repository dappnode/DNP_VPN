import '../css/styles.css';
// Node Modules
import FileSaver from 'file-saver';
import parser from 'ua-parser-js';
// Modules
import getCredentialsFromUrl from './Modules/getCredentialsFromUrl';
import selectorOS from './Modules/selectorOS';
import selectorUser from './Modules/selectorUser';
import credentialsDisplay from './Modules/credentialsDisplay';
import errorDisplay from './Modules/errorDisplay';
import downloadLink from './Modules/downloadLink';
import generateMobileConfigFile from './Modules/generateMobileConfigFile';

(function() {

  // Setup variables
  var credentials = getCredentialsFromUrl()
  , userAgent = parser(navigator.userAgent)
  , optionsOS = {
    MacOS: 'MacOS',
    Windows: 'Windows',
    iOS: 'iOS',
    Android: 'Android',
    Chromebook: 'Chromebook',
    Others: 'Others'
  };

  if (credentials) {
    generateMobileConfigFile(credentials);
    credentialsDisplay(credentials);
    selectorUser()
    selectorOS(optionsOS, userAgent);
    downloadLink(credentials, userAgent);
  } else {
    errorDisplay();
  }

})();
