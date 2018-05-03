export default function (options, ua) {

  // Generate html, OS display
  var html = document.getElementById("selectorOSContainer").innerHTML;

  // OS selector
  html +=
    '<div id="selectorOS" class="HBcontainer">';
  for (var optionID in options) {
    html +=
      '<div class="HBbox">'
    + '<span><button class="btnOS" id="btn_'+optionID+'">'+options[optionID]+'</button></span>'
    + '</div>';
  }
  html +=
    '</div>'
  + '<p>Your OS: <strong>'+ua.os.name+'</strong> '+ua.os.version+'</p>';

  document.getElementById("selectorOSContainer").innerHTML = html;

  // Attach functionality
  var header = document.getElementById("selectorOS");
  var btns = header.getElementsByClassName("btnOS");

  for (var i = 0; i < btns.length; i++) {

    btns[i].addEventListener("click", function() {
      switchBody(options,this.id.split('_')[1]);
      var current = document.getElementsByClassName("btnOS active");
      if (current.length > 0) {
        current[0].className = current[0].className.replace(" active", "");
      }
      this.className += " active";
    });

  }

  // Initialize the selector
  var selectedOS = guessFirstSelection(ua);

  if (selectedOS) {
    var sectionDOM = document.getElementById('btn_'+selectedOS);
    if (!sectionDOM.className.includes('active')) {
      sectionDOM.className += " active";
    }
    switchBody(options, selectedOS);
  }

}


function switchBody(options,id) {

  // hide all
  for (var optionID in options) {
    var sectionDOM = document.getElementById(optionID);
    if(Boolean(sectionDOM)){
      sectionDOM.style.display = "none";
    }
  }

  // show selected
  var sectionDOM = document.getElementById(id);
  if(Boolean(sectionDOM)){
    sectionDOM.style.display = "block";
  }

}


function guessFirstSelection(ua) {

  if (ua.os.name.includes('Mac OS')) {
    return 'MacOS';
  } else if (ua.os.name.includes('Android')) {
    return 'Android';
  } else if (ua.os.name.includes('iPhone')) {
    return 'iPhone';
  }

}
