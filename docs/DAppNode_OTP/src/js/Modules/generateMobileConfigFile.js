import FileSaver from 'file-saver';
import generateTagsFromCredentials from './generateTagsFromCredentials';
import MOBILECONFIG_TEMPLATE from './mobileConfigTemplate.txt';


String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};


export default function(credentials) {

  var credentialTags = generateTagsFromCredentials(credentials, true);
	var mobileConfigFile = MOBILECONFIG_TEMPLATE;

  for (var tag in credentialTags) {
    mobileConfigFile = mobileConfigFile.replaceAll(tag, credentialTags[tag]);
  }

	console.log('mobileConfigFile',mobileConfigFile)
  var blob = new Blob([mobileConfigFile], {type: "text/plain;charset=utf-8"});
  window.downloadMobileConfig = function() {
    FileSaver.saveAs(blob, "connect_to_your_DAppNode.mobileconfig");
    console.log('Downloaded config file')
  }

}
