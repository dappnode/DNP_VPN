const BTN_BACK_TEXT = '\u21a9'+' back'; // add unicode arrow


export default function () {

  // Add functionality to show
  document.getElementById("btn_guide").addEventListener("click", function() {
    show(document.getElementById("guide"));
    hide(document.getElementById("noGuide"));
  });

  document.getElementById("btn_back").innerHTML = BTN_BACK_TEXT;

  document.getElementById("btn_back").addEventListener("click", function() {
    hide(document.getElementById("guide"));
    show(document.getElementById("noGuide"));
  });

  document.getElementById("btn_backHeader").addEventListener("click", function() {
    hide(document.getElementById("guide"));
    show(document.getElementById("noGuide"));
  });

  window.back = function() {
    hide(document.getElementById("guide"));
    show(document.getElementById("noGuide"));
  }
	
}


function show (elem) {
	elem.style.display = 'block';
};


// Hide an element
function hide (elem) {
	elem.style.display = 'none';
};
