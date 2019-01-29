#!/bin/sh

# Initialize APP
echo "Initializing App..."
node src/initializeApp.js
echo "Initialized App"

# Generate credentials
echo "Fetching VPN credentials: ADMIN, PSK, IP"
export ADMIN_USER="dappnode_admin"
export PUBLIC_ENDPOINT="$(node src/getPublicEndpointCommand)"
# Write credentials (password and PSK) so on the next reset the credentials stay the same 
echo "Fetched VPN credentials: ADMIN admin user: $ADMIN_USER, public endpoint: $PUBLIC_ENDPOINT"

# Supervisord processes:
supervisord
