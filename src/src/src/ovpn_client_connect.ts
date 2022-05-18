#!/usr/bin/env node

// Hook called by openvpn binary on each client connection
// Has ENV variables added by the openvpn binary. Main ones:
// - common_name: The X509 common name of an authenticated client
// - trusted_ip: Actual IP address of connecting client or peer which has been authenticated

import got from "got";
import url from "url";
import { API_PORT, CLIENT_CONNECT_PATHNAME } from "./params";

//"http://127.0.0.1:3000/client-connect";
const apiUrl = url.format({
  protocol: "http",
  hostname: "127.0.0.1",
  port: API_PORT,
  pathname: CLIENT_CONNECT_PATHNAME
});

got
  .post(apiUrl, { json: process.env })
  .then(
    () => console.log(`Posted client-connect data to ${url}`),
    e => console.error(`Error posting client-connect env to ${url}: ${e.stack}`)
  )
  // client-connect script must exit with code 0, otherwise OpenVPN will refuse to connect to the client
  .then(() => process.exit(0));
