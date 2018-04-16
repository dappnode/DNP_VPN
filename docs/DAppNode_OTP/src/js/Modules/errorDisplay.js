// errorDisplay module

export default function () {
  document.getElementById("noGuide").style.display = 'none';
  let html = '<h1>Error</h1>';
  html += 'Invalid link, contact your DAppNode administrator';
  document.getElementById("error").innerHTML = html;
}
