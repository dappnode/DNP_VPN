"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCredentialsWebserver = void 0;
const http_1 = __importDefault(require("http"));
const url_1 = __importDefault(require("url"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const credentialsFile_1 = require("./credentialsFile");
const params_1 = require("../params");
// Make sure credPath is prepended by "/": "/cred".
// Otherwise the switch string comparison will fail.
const credUrlPathname = path_1.default.join("/", params_1.CRED_URL_PATHNAME);
/**
 * Starts a credentials webserver which users use to get their VPN credentials
 * - Serves a UI to decrypt and fetch the actual ovpn file
 * - Serves ovpn files
 * - Returns obscure response for any other case
 * @param port
 */
function startCredentialsWebserver(port) {
    if (!process.env.UI_OPENVPN_PATH)
        throw Error("UI_OPENVPN_PATH not set");
    const indexHtml = fs_1.default.readFileSync(process.env.UI_OPENVPN_PATH, "utf8");
    const server = http_1.default.createServer((req, res) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (!req.url)
                throw Error("No URL");
            const { pathname, query } = url_1.default.parse(req.url, true);
            const token = query[params_1.CRED_URL_QUERY_PARAM];
            if (typeof token !== "string")
                throw Error("Invalid token");
            if (!credentialsFile_1.isTokenKnown(token))
                throw Error("Unknown token");
            switch (pathname) {
                case "/":
                    res.writeHead(200, { "Content-Type": "text/html" });
                    return res.end(indexHtml, "utf-8");
                case credUrlPathname:
                    try {
                        const credFile = yield credentialsFile_1.generateCredFileFromToken(token);
                        res.writeHead(200, { "Content-Type": "text/plain" });
                        return res.end(credFile, "utf-8");
                    }
                    catch (e) {
                        res.writeHead(500, { "Content-Type": "text/plain" });
                        res.end(e.message);
                    }
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
    }));
    server.listen(port, () => console.log(`Credentials webserver started at ${port}`));
}
exports.startCredentialsWebserver = startCredentialsWebserver;
//# sourceMappingURL=webserver.js.map