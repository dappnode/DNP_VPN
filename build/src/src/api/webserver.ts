import http from "http";
import url from "url";
import fs from "fs";
import { isValidCredFilename, getCredFile } from "../openvpn/credentialsFile";

const port = 8092;

startWebserver();

export function startWebserver() {
  const indexHtml = fs.readFileSync(openVpnUiIndex, "utf8");

  const server = http.createServer((req, res) => {
    try {
      if (!req.url) throw Error("No URL");
      const { pathname, query } = url.parse(req.url, true);
      const filename = query.id;
      if (!filename) throw Error("No filename");
      if (typeof filename !== "string") throw Error("filename not string");

      switch (pathname) {
        case "/":
          if (!isValidCredFilename(filename)) throw Error("Invalid filename");
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end(indexHtml, "utf-8");
          break;

        case "/cred":
          const credFile = getCredFile(filename);
          res.writeHead(200, { "Content-Type": "text/plain" });
          res.end(credFile, "utf-8");
          break;

        default:
          throw Error("Bye");
      }
    } catch (e) {
      // res.destroy() achieves the same effect ass NGINX 444 = CONNECTION CLOSED WITHOUT RESPONSE
      // curl -vv
      // > * Empty reply from server
      res.destroy();
    }
  });

  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });
}
