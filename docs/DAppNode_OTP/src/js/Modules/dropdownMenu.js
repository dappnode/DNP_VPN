
export default function (options) {
  // Generate html
  let html = '<div class="dropdown">';
  html += '<button class="dropbtn" id="dropbtn">Select your OS</button>';
  html += '<div id="myDropdown" class="dropdown-content">';
  options.forEach(function(option) {
    html += '<a href="#'+option+'">'+option+'</a>';
  });
  html += '</div></div>';

  $('#dropdownMenu').html(html);

  // Bind js events
  $("#dropbtn").click(function(){
    $("#myDropdown").toggle();
  });
  // Close the dropdown if the user clicks outside of it
  window.onclick = function(e) {
    if (!e.target.matches('.dropbtn')) {
      var myDropdown = document.getElementById("myDropdown");
      if (myDropdown.classList.contains('show')) {
        myDropdown.classList.remove('show');
      }
    }
  }
}
