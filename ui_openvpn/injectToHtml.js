const fs = require("fs");
const path = require("path");

/**
 * This module replaces js and css link with the content they refer to
 * The result is an self-contained html that does not require extra static files
 * This is necessary for the current scheme where the url param ?id=<id> is used
 * to "authenticate" the user and serve the correct html or a 404
 */

const indexHtmlPath = process.argv[2];
const outputHtmlPath = process.argv[3];

if (!indexHtmlPath || !outputHtmlPath)
  throw Error("Usage: injectToHtml [input-html] [output-html]");

const baseDir = path.parse(indexHtmlPath).dir;
let htmlString = fs.readFileSync(indexHtmlPath, "utf8");

function getMimeType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".gif") return "image/gif";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".webp") return "image/webp";
  if (ext === ".ico") return "image/x-icon";
  if (ext === ".bmp") return "image/bmp";
  return "application/octet-stream";
}

// Replace js scripts

const jsTags = htmlString.match(/<script[^<>]+><\/script>/g) || [];
// [ '<script type="text/javascript" src="/static/js/main.0b9b0536.js"></script>' ]
for (const jsTag of jsTags) {
  const jsSubPath = (jsTag.split('src="')[1] || "").split('"')[0];
  const jsPath = path.resolve(baseDir, `.${jsSubPath}`); // Make "/" path "./"
  console.log({ jsPath, jsSubPath });
  const jsString = fs.readFileSync(jsPath, "utf8");

  // Custom replace, String.replace cause strange errors in this substitution
  const [a, b, c] = htmlString.split(jsTag);
  if (c)
    throw Error(
      `There are multiple occurrences of jsTag "${jsTag}". There must be only one`
    );
  if (!b)
    throw Error(
      `Error splitting html string. ${jsTag} must be within the html body`
    );
  htmlString = a + "<script>\n" + jsString + "\n</script>" + b;
}

// Replace css scripts

const cssTags = htmlString.match(/<link[^<>]+stylesheet[^<>]+>/g) || [];
// [ '<link href="/static/css/main.5d2936ec.css" rel="stylesheet">' ]
for (const cssTag of cssTags) {
  const cssSubPath = (cssTag.split('href="')[1] || "").split('"')[0];
  const cssPath = path.resolve(baseDir, `.${cssSubPath}`); // Make "/" path "./"
  console.log({ cssPath, cssSubPath });
  const cssString = fs.readFileSync(cssPath, "utf8");

  // Custom replace, String.replace cause strange errors in this substitution
  const [a, b, c] = htmlString.split(cssTag);
  if (c)
    throw Error(
      `There are multiple occurrences of cssString "${cssString}". There must be only one`
    );
  if (!b)
    throw Error(
      `Error splitting html string. ${cssPath} must be within the html body`
    );
  htmlString = a + "<style>\n" + cssString + "\n</style>" + b;
}

// Inline media assets referenced by js/css bundles
const mediaDir = path.resolve(baseDir, "./static/media");
if (fs.existsSync(mediaDir)) {
  const mediaFiles = fs.readdirSync(mediaDir);
  for (const mediaFile of mediaFiles) {
    const mediaPath = path.resolve(mediaDir, mediaFile);
    const mediaSubPath = `/static/media/${mediaFile}`;
    const mediaBase64 = fs.readFileSync(mediaPath).toString("base64");
    const mediaDataUri = `data:${getMimeType(mediaFile)};base64,${mediaBase64}`;

    if (htmlString.includes(mediaSubPath)) {
      htmlString = htmlString.split(mediaSubPath).join(mediaDataUri);
      console.log({ inlinedMedia: mediaSubPath });
    }
  }
}

fs.writeFileSync(outputHtmlPath, htmlString);
