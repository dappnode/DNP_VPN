import http from "http";
import url from "url";
import fs from "fs";
import path from "path";
import { isTokenKnown, generateCredFileFromToken } from "./credentialsFile";
import { CRED_URL_QUERY_PARAM, CRED_URL_PATHNAME } from "../params";

// Make sure credPath is prepended by "/": "/cred".
// Otherwise the switch string comparison will fail.
const credUrlPathname = path.join("/", CRED_URL_PATHNAME);

/**
 * Starts a credentials webserver which users use to get their VPN credentials
 * - Serves a UI to decrypt and fetch the actual ovpn file
 * - Serves ovpn files
 * - Returns obscure response for any other case
 * @param port
 */
export function startCredentialsWebserver(port: number): void {
  if (!process.env.UI_OPENVPN_PATH) throw Error("UI_OPENVPN_PATH not set");
  const indexHtml = fs.readFileSync(process.env.UI_OPENVPN_PATH, "utf8");

  const server = http.createServer(async (req, res) => {
    try {
      if (!req.url) throw Error("No URL");
      const { pathname, query } = url.parse(req.url, true);
      const token = query[CRED_URL_QUERY_PARAM];
      if (typeof token !== "string") throw Error("Invalid token");
      if (!isTokenKnown(token)) throw Error("Unknown token");

      switch (pathname) {
        case "/":
          res.writeHead(200, { "Content-Type": "text/html" });
          return res.end(indexHtml, "utf-8");

        case credUrlPathname:
          try {
            const credFile = await generateCredFileFromToken(token);
            res.writeHead(200, { "Content-Type": "text/plain" });
            return res.end(credFile, "utf-8");
          } catch (e) {
            res.writeHead(500, { "Content-Type": "text/plain" });
            res.end(e.message);
          }

        default:
          throw Error("Bye");
      }
    } catch (e) {
      // res.destroy() achieves the same effect ass NGINX 444 = CONNECTION CLOSED WITHOUT RESPONSE
      // curl http://localhost:$port -vv
      // > * Empty reply from server
      res.destroy();
    }
  });

  server.listen(port, () =>
    console.log(`Credentials webserver started at ${port}`)
  );
}
