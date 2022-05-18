"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWebserver = void 0;
const http_1 = __importDefault(require("http"));
const url_1 = __importDefault(require("url"));
const fs_1 = __importDefault(require("fs"));
const credentialsFile_1 = require("../openvpn/credentialsFile");
const port = 8092;
const openVpnUiIndex = "";
startWebserver();
function startWebserver() {
    const indexHtml = fs_1.default.readFileSync(openVpnUiIndex, "utf8");
    const server = http_1.default.createServer((req, res) => {
        try {
            if (!req.url)
                throw Error("No URL");
            const { pathname, query } = url_1.default.parse(req.url, true);
            const filename = query.id;
            if (!filename)
                throw Error("No filename");
            if (typeof filename !== "string")
                throw Error("filename not string");
            switch (pathname) {
                case "/":
                    if (!credentialsFile_1.isValidCredFilename(filename))
                        throw Error("Invalid filename");
                    res.writeHead(200, { "Content-Type": "text/plain" });
                    res.end(indexHtml, "utf-8");
                    break;
                case "/cred":
                    const credFile = credentialsFile_1.getCredFile(filename);
                    res.writeHead(200, { "Content-Type": "text/plain" });
                    res.end(credFile, "utf-8");
                    break;
                default:
                    throw Error("Bye");
            }
        }
        catch (e) {
            // res.destroy() achieves the same effect ass NGINX 444 = CONNECTION CLOSED WITHOUT RESPONSE
            // curl http://localhost:$port -vv
            // > * Empty reply from server
            res.destroy();
        }
    });
    server.listen(port, () => {
        console.log(`Server running at http://localhost:${port}/`);
    });
}
exports.startWebserver = startWebserver;
//# sourceMappingURL=webserver.js.map