
// Test the functionality of Blobs in current environment
try {
  var isFileSaverSupported = !!new Blob;
} catch (e) {
  console.log('error',e)
}


export default function (credentialTags, ua) {
  var fileSaveSupported = true;

  if (
    ua.browser.name.includes('Firefox') && ua.browser.major < 20
    || ua.browser.name.includes('Opera') && ua.browser.major < 15
    || ua.browser.name.includes('Safari') && ua.browser.major < 10
  ) {
    fileSaveSupported = false;
  }

  if (fileSaveSupported) {
    downloadLinkSupported();
  } else {
    downloadLinkUnsupported(ua);
  }

}


function downloadLinkSupported() {

  document.getElementById("downloadLink").innerHTML =
    '<ol>'
  +   '<li>Download the automatic config file</li>'
  +     '<button class="btn" onclick="downloadMobileConfig()" class="mobileConfig_DL">DOWNLOAD</button>'
  +   '<li>Execute the file and follow the steps</li>'
  + '</ol>';

}


function downloadLinkForSafari() {

  // Generate html
  document.getElementById("downloadLink").innerHTML =
    '<h3>Hit download and cmd + S to save the file as "dappnode.mobileconfig"</h3>';
  + '<button class="btn" onclick="downloadMobileConfig()" id="btn_DL">DOWNLOAD</button>';

}


function downloadLinkUnsupported(ua) {

  // Generate html
  document.getElementById("downloadLink").innerHTML =
    '<ol>'
  +   '<li>If you want to setup the VPN automatically, please open this page in any of these browsers:</li>'
  +     '<p>Chrome, Firefox 20+, Safari 10.1+, Opera 15+, Edge</p>'
  +   '<p>Your browser: <strong>'+ua.browser.name+'</strong> '+ua.browser.version+'</p>'
  + '</ol>';

}
