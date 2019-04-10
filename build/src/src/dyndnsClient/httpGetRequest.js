const http = require("http");
const https = require("https");

/**
 * Handles a GET request to a given url
 * Use the options to switch between json or text returns
 *
 * @param {String} url The url to do the request to
 * @param {Object} options Options:
 * - format: 'json' or 'text', to switch parsing
 *
 * @return {Object} Parsed response.
 * {
 *   data: parsedData <String or Object>,
 *   code: statusCode <Integer>
 * }
 */
function httpGetRequest(url, options = {}) {
  // Source code from nodejs docs https://nodejs.org/api/http.html#http_http_get_options_callback
  return new Promise((resolve, reject) => {
    // Parse protocol
    let client;
    if (url.startsWith("http://")) {
      client = http;
    } else if (url.startsWith("https://")) {
      client = https;
    } else {
      return reject(Error(`Unknown url prefix: ${url}, must be http(s)://`));
    }

    // Parse format
    const { format = "json" } = options;

    client
      .get(url, res => {
        const { statusCode } = res;
        const contentType = res.headers["content-type"];

        if (!contentType.includes(format)) {
          // consume response data to free up memory
          res.resume();
          return reject(
            Error(
              `Invalid content-type: expected ${format} but received ${contentType}`
            )
          );
        }

        res.setEncoding("utf8");
        let rawData = "";
        res.on("data", chunk => {
          rawData += chunk;
        });
        res.on("end", () => {
          if (format === "json") {
            try {
              const parsedData = JSON.parse(rawData);
              resolve({
                data: parsedData,
                code: statusCode
              });
            } catch (e) {
              reject(
                Error(`Error parsing response: ${e.message}, data: ${rawData}`)
              );
            }
          } else {
            resolve({
              data: rawData,
              code: statusCode
            });
          }
        });
      })
      .on("error", e => {
        reject(Error(`Failed GET request to ${url}: ${e.stack || e.message}`));
      });
  });
}

module.exports = httpGetRequest;
