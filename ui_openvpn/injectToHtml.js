const fs = require("fs");
const path = require("path");

/**
 * This module replaces js and css link with the content they refer to
 * The result is an self-contained html that does not require extra static files
 * This is necessary for the current scheme where the url param ?id=<id> is used
 * to "authenticate" the user and serve the correct html or a 404
 */

const mimeTypes = {
  ".png": "image/png",
  ".gif": "image/gif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
};

const indexHtmlPath = process.argv[2];
const outputHtmlPath = process.argv[3];

if (!indexHtmlPath || !outputHtmlPath)
  throw Error("Usage: injectToHtml [input-html] [output-html]");

const baseDir = path.parse(indexHtmlPath).dir;
let htmlString = fs.readFileSync(indexHtmlPath, "utf8");

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
      `There are multiple occurrences of jsTag "${jsTag}". There must be only one`,
    );
  if (!b)
    throw Error(
      `Error splitting html string. ${jsTag} must be within the html body`,
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
      `There are multiple occurrences of cssString "${cssString}". There must be only one`,
    );
  if (!b)
    throw Error(
      `Error splitting html string. ${cssPath} must be within the html body`,
    );
  htmlString = a + "<style>\n" + cssString + "\n</style>" + b;
}

// Replace static media file references with inline base64 data URIs
// CRA puts images in /static/media/ (e.g. "/static/media/logo.30a8e17e.png")
// These references appear in the inlined JS as string literals.
const mediaDir = path.resolve(baseDir, "static", "media");
if (fs.existsSync(mediaDir)) {
  const mediaFiles = fs.readdirSync(mediaDir);
  for (const mediaFile of mediaFiles) {
    const ext = path.extname(mediaFile).toLowerCase();
    const mime = mimeTypes[ext];
    if (!mime) continue; // skip non-image files

    const mediaPath = path.join(mediaDir, mediaFile);
    const mediaRef = `/static/media/${mediaFile}`;

    // Only replace if the reference actually appears in the HTML
    if (!htmlString.includes(mediaRef)) continue;

    const fileBuffer = fs.readFileSync(mediaPath);
    const base64 = fileBuffer.toString("base64");
    const dataUri = `data:${mime};base64,${base64}`;

    console.log(`Inlining media: ${mediaRef} (${fileBuffer.length} bytes)`);

    // Replace all occurrences of the media reference with the data URI
    while (htmlString.includes(mediaRef)) {
      htmlString = htmlString.split(mediaRef).join(dataUri);
    }
  }
}

fs.writeFileSync(outputHtmlPath, htmlString);
