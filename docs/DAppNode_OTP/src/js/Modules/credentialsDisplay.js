// credentialsDisplay Module
import generateTagsFromCredentials from './generateTagsFromCredentials';

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

let copyButtonText = 'copy';

function credentialsDisplayWriteHTML(_credentials, tagNames) {
  let credentials = Object.assign({}, _credentials);
  delete credentials.name;
  // Generate the credentials display html
  let html = '';
  html += '<table align="center">';
  for (let tag in credentials) {
    html += '<tr><td align="right">'+tagNames[tag]+'</td>';
    let inputHtml = '';
    inputHtml += '<div class="input-group">';
    inputHtml += '<input id="'+tag+'" value="'+credentials[tag]+'" readonly="readonly">';
    inputHtml += '<button type="button" class="copyButton">'+copyButtonText+'</button>';
    inputHtml += '</div>';
    html += '<td>'+inputHtml+'</td></tr>';
  }
  html += '</table>';
  document.getElementById("credentials").innerHTML = html;
}

function credentialsApplyToGuide(credentialTags) {
  // Generate the credentials display html
  let html = document.getElementById("guide").innerHTML;
  for (let tag in credentialTags) {
    let inputHtml = '';
    inputHtml += '<div class="input-group">';
    inputHtml += '<input id="'+tag+'" value="'+credentialTags[tag]+'" readonly="readonly">';
    inputHtml += '<button type="button" class="copyButton">'+copyButtonText+'</button>';
    inputHtml += '</div>';
    html = html.replaceAll(tag, inputHtml);
  }
  document.getElementById("guide").innerHTML = html;
}

function attachFunctionality() {
  // Attach functionality
  setTimeout(function(){
    $('.copyButton').on('click', function(){
      $(this).prev('input').select();
      console.log(this)
      document.execCommand("Copy");
      console.log('text copied')
    });
  }, 200);
}

function attachFunctionalityNoJquery() {
  // Attach functionality
  setTimeout(function(){
    let copyButtons = document.getElementsByClassName("copyButton");
    for (var i = 0; i < copyButtons.length; i++) {
      copyButtons[i].addEventListener("click", function(){
        this.previousSibling.select();
        document.execCommand("Copy");
      });
    }
  }, 200);
}



export default function (credentials) {

  let tagNames = {
    pass: 'Password'
    , psk: 'IPSec PSK'
    , server: 'Server address'
    , user: 'Username'
  }

  credentialsDisplayWriteHTML(credentials, tagNames);
  let credentialTags = generateTagsFromCredentials(credentials);
  credentialsApplyToGuide(credentialTags);
  // attachFunctionality();
  attachFunctionalityNoJquery();
}
