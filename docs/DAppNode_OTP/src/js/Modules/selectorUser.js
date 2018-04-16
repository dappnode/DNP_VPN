// Show an element
let show = function (elem) {
	elem.style.display = 'block';
};

// Hide an element
let hide = function (elem) {
	elem.style.display = 'none';
};

export default function () {
  // Add functionality to show
  document.getElementById("btn_guide").addEventListener("click", function() {
    show(document.getElementById("guide"));
    hide(document.getElementById("noGuide"));
  });

  let btn_back_text = '\u21a9'+' back'; // add unicode arrow
  document.getElementById("btn_back").innerHTML = btn_back_text;

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
