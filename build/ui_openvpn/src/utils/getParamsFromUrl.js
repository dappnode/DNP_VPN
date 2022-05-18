// Expected format
// http://origin/?id=<id>#<key>
// - id: is an alphanumeric identifier
// - key: base64 encoded string
//
// http://origin/7e00cfadbe61f2ed#mc5pGQQ4VbbuWJDayJD0kXsElAUddmUktJYUYSDNaDE=

const urlTemplate = "http://origin/?id=<id>#<key>";

export default function getParamsFromUrl() {
  const urlParams = parseUrlParams(clean(window.location.search));

  // Dev param to be able to work on the UI
  if (urlParams.dev) return { dev: urlParams.dev };

  const { id, name } = urlParams;
  const key = decodeURIComponent(clean(window.location.hash));
  if (!id) throw Error("No valid id provided. Url must be " + urlTemplate);
  if (!key) throw Error("No valid key provided. Url must be " + urlTemplate);
  return { key, id, name };
}

function parseUrlParams(str) {
  var obj = {};
  str.replace(/([^=&]+)=([^&]*)/g, function(m, key, value) {
    obj[decodeURIComponent(key)] = decodeURIComponent(value);
  });
  return obj;
}

function clean(s) {
  if (!s) return s;
  return s
    .trim()
    .replace("/", "")
    .replace("#", "")
    .replace("?", "");
}
