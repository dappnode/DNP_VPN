import generateTagsFromCredentials from './generateTagsFromCredentials';

const COPY_BUTTON_TEXT = 'copy';

function credentialsDisplayWriteHTML(_credentials, tagNames) {

  var credentials = Object.assign({}, _credentials);
  delete credentials.name;

  // Generate the credentials display html
  var html = '';
  html += '<table align="center">';
  for (var tag in credentials) {

    html +=
    '<tr>'
  +   '<td align="right">'+tagNames[tag]+'</td>'
  +   '<td>'
  +     '<div class="input-group">'
  +       '<input id="'+tag+'" value="'+credentials[tag]+'" readonly="readonly">'
  +       '<button type="button" class="copyButton">'+COPY_BUTTON_TEXT+'</button>'
  +     '</div>'
  +   '</td>'
  + '</tr>';

  }
  html += '</table>';

  document.getElementById("credentials").innerHTML = html;

}


function credentialsApplyToGuide(credentialTags) {

  // Generate the credentials display html
  var html = document.getElementById("guide").innerHTML;

  for (var tag in credentialTags) {

    var inputHtml =
        '<div class="input-group">'
      +   '<input id="'+tag+'" value="'+credentialTags[tag]+'" readonly="readonly">'
      +   '<button type="button" class="copyButton">'+COPY_BUTTON_TEXT+'</button>'
      + '</div>';

    html = html.replaceAll(tag, inputHtml);

  }

  document.getElementById("guide").innerHTML = html;

}


function attachFunctionalityNoJquery() {

  // Attach functionality
  setTimeout(function(){

    var copyButtons = document.getElementsByClassName("copyButton");
    for (var i = 0; i < copyButtons.length; i++) {
      copyButtons[i].addEventListener("click", function(){
        this.previousSibling.select();
        document.execCommand("Copy");
      });
    }

  }, 200);

}


export default function (credentials) {

  var tagNames = {
    pass: 'Password'
    , psk: 'IPSec PSK'
    , server: 'Server address'
    , user: 'Username'
  }

  var credentialTags = generateTagsFromCredentials(credentials);

  credentialsDisplayWriteHTML(credentials, tagNames);
  credentialsApplyToGuide(credentialTags);
  attachFunctionalityNoJquery();

}


String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
