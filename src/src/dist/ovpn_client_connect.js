#!/usr/bin/env node
"use strict";
// Hook called by openvpn binary on each client connection
// Has ENV variables added by the openvpn binary. Main ones:
// - common_name: The X509 common name of an authenticated client
// - trusted_ip: Actual IP address of connecting client or peer which has been authenticated
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const got_1 = __importDefault(require("got"));
const url_1 = __importDefault(require("url"));
const params_1 = require("./params");
//"http://127.0.0.1:3000/client-connect";
const apiUrl = url_1.default.format({
    protocol: "http",
    hostname: "127.0.0.1",
    port: params_1.API_PORT,
    pathname: params_1.CLIENT_CONNECT_PATHNAME
});
got_1.default
    .post(apiUrl, { json: process.env })
    .then(() => console.log(`Posted client-connect data to ${url_1.default}`), e => console.error(`Error posting client-connect env to ${url_1.default}: ${e.stack}`))
    // client-connect script must exit with code 0, otherwise OpenVPN will refuse to connect to the client
    .then(() => process.exit(0));
//# sourceMappingURL=ovpn_client_connect.js.map