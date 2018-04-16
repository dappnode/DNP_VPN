// downloadLink Module

try {
    var isFileSaverSupported = !!new Blob;
} catch (e) {
  console.log('error',e)
}

function downloadLinkSupported() {
  // Generate html
  let html = '<ol>';
  html += '<li>Download the automatic config file</li>';
  html += '<button class="btn" onclick="downloadMobileConfig()" class="mobileConfig_DL">DOWNLOAD</button>';
  html += '<li>Execute the file and follow the steps</li>';
  html += '</ol>';
  document.getElementById("downloadLink").innerHTML = html;
}

function downloadLinkForSafari() {
  // Generate html
  let html = '<h3>Hit download and cmd + S to save the file as "dappnode.mobileconfig"</h3>';
  html += '<button class="btn" onclick="downloadMobileConfig()" id="btn_DL">DOWNLOAD</button>';
  document.getElementById("downloadLink").innerHTML = html;
  // Attach functionality
}

function downloadLinkUnsupported(ua) {
  // Generate html
  let html = '<ol>';
  html += '<li>If you want to setup the VPN automatically, please open this page in any of these browsers:</li>';
  html += '<p>Chrome, Firefox 20+, Safari 10.1+, Opera 15+, Edge</p>';
  html += '<p>Your browser: <strong>'+ua.browser.name+'</strong> '+ua.browser.version+'</p>';
  html += '</ol>';
  document.getElementById("downloadLink").innerHTML = html;
}

export default function (credentialTags, ua) {
  let fileSaveSupported = true;

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
