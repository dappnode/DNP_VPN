#!/usr/bin/env node

// Hook called by openvpn binary on each client connection
// Has ENV variables added by the openvpn binary. Main ones:
// - common_name: The X509 common name of an authenticated client
// - trusted_ip: Actual IP address of connecting client or peer which has been authenticated

import got from "got";

got.post("http://127.0.0.1:3000/client-connect", { json: process.env });
