import '../css/styles.scss';
// Node Modules
import FileSaver from 'file-saver';
import parser from 'ua-parser-js';
// Modules
import getCredentialsFromUrl from './Modules/getCredentialsFromUrl';
import selectorOS from './Modules/selectorOS';
import selectorUser from './Modules/selectorUser';
import dropdownMenu from './Modules/dropdownMenu';
import credentialsDisplay from './Modules/credentialsDisplay';
import errorDisplay from './Modules/errorDisplay';
import downloadLink from './Modules/downloadLink';
import generateMobileConfigFile from './Modules/generateMobileConfigFile';
// BELOW delete for production
import './Modules/generateSampleOTP';


(function() {
  // Setup variables
  let credentials = getCredentialsFromUrl()
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
    // dropdownMenu(options);
    selectorUser()
    selectorOS(optionsOS, userAgent);
    downloadLink(credentials, userAgent);
  } else {
    errorDisplay();
  }

})();
