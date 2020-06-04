const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * This module replaces js and css link with the content they refer to
 * The result is an self-contained html that does not require extra static files
 * This is necessary for the current scheme where the url param ?id=<id> is used
 * to "authenticate" the user and serve the correct html or a 404
 */

const indexPath = path.resolve(__dirname, './build/index.html');
let htmlString = fs.readFileSync(indexPath, 'utf8');

// Replace js scripts

const jsTags = htmlString.match(/<script[^<>]+><\/script>/g) || []
// [ '<script type="text/javascript" src="/static/js/main.0b9b0536.js"></script>' ]
jsTags.forEach(jsTag => {
    try {
        const jsSubPath = (jsTag.split('src="')[1] || "").split('"')[0]
        const jsPath = path.resolve(__dirname, './build', `.${jsSubPath}`);
        console.log({jsPath, jsSubPath})
        const jsString = fs.readFileSync(jsPath, 'utf8'); 

        // Custom replace, String.replace cause strange errors in this substitution
        const [a, b, c] = htmlString.split(jsTag)
        if (c) throw Error(`There are multiple occurrences of jsTag "${jsTag}". There must be only one`)
        if (!b) throw Error(`Error splitting html string. ${jsTag} must be within the html body`)
        htmlString = a + '<script>\n' + jsString + '\n</script>' + b
    } catch (e) {
        console.error(`Error injecting js from ${jsTag}: ${e.stack}`)
    }
})

// Replace css scripts

const cssTags = htmlString.match(/<link[^<>]+stylesheet[^<>]+>/g) || [];
// [ '<link href="/static/css/main.5d2936ec.css" rel="stylesheet">' ]
cssTags.forEach(cssTag => {
    try {
        const cssSubPath = (cssTag.split('href="')[1] || "").split('"')[0]
        const cssPath = path.resolve(__dirname, './build', `.${cssSubPath}`);
        console.log({cssPath, cssSubPath})
        const cssString = fs.readFileSync(cssPath, 'utf8'); 

        // Custom replace, String.replace cause strange errors in this substitution
        const [a, b, c] = htmlString.split(cssTag)
        if (c) throw Error(`There are multiple occurrences of cssString "${cssString}". There must be only one`)
        if (!b) throw Error(`Error splitting html string. ${cssPath} must be within the html body`)
        htmlString = a + '<style>\n' + cssString + '\n</style>' + b
    } catch (e) {
        console.error(`Error injecting css from ${cssTag}: ${e.stack}`)
    }
})

fs.writeFileSync(indexPath, htmlString)
