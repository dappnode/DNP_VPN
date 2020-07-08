#!/usr/bin/env node

import got from "got";

got.post("http://127.0.0.1:3000/client-connect", { json: process.env });

// #!/bin/bash

// # Hook called by openvpn binary on each client connection
// # Has ENV variables added by the openvpn binary
// # - common_name: The X509 common name of an authenticated client
// # - trusted_ip: Actual IP address of connecting client or peer which has been authenticated

// wget -qO- http://127.0.0.1:3030/client-connect --method post --body-data "$(env)" --header "Content-Type:text/plain"
// exit 0

// # # Script to delete the credentials file of a client once connected

// # # Import global variables first
// # source /etc/env.sh

// # SALT=$(cat ${SALT_PATH})
// # FILE=$(echo -n ${SALT}${common_name} | sha256sum | cut -c -16)

// # if [ -e "${OPENVPN_CRED_DIR}/${FILE}" ]; then
// #     rm "${OPENVPN_CRED_DIR}/${FILE}"
// # fi

// # # Reset login text
// # if [ "${common_name}" = "${DEFAULT_ADMIN_USER}" ]; then
// #     echo "The admin credentials expired. Use the command below to generate a new download link:" > "$LOGIN_MSG_PATH"
// #     echo "dappnode_get ${DEFAULT_ADMIN_USER}" >> "$LOGIN_MSG_PATH"
// # fi
