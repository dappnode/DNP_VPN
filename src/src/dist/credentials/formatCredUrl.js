"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCredUrl = void 0;
const url_1 = __importDefault(require("url"));
const params_1 = require("../params");
/**
 * Formats a URL to fetch a credentials file
 * http://${hostname}:${CRED_PORT}/?id=${idToken}#${secretKey}
 */
function formatCredUrl({ hostname, token, key }) {
    const search = new url_1.default.URLSearchParams();
    search.set(params_1.CRED_URL_QUERY_PARAM, token);
    return url_1.default.format({
        protocol: "http",
        hostname,
        port: params_1.OPENVPN_CRED_PORT,
        hash: encodeURIComponent(key),
        search: search.toString(),
        // Must have forward slash "/" at the end of the path
        // "/" is necessary for Linux terminals to make the entire URL clickable
        pathname: "/"
    });
}
exports.formatCredUrl = formatCredUrl;
//# sourceMappingURL=formatCredUrl.js.map