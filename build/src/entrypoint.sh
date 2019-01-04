
# Generate credentials
export ADMIN_USER="dappnode_admin"
export ADMIN_PASSWORD="$([ -f ${VPN_ADMIN_PASS_PATH} ] && cat ${VPN_ADMIN_PASS_PATH} || echo $(LC_CTYPE=C tr -dc 'A-HJ-NPR-Za-km-z2-9' < /dev/urandom | head -c 20))"
export PSK="$([ -f ${PSK_PATH} ] && cat ${PSK_PATH} || echo $(LC_CTYPE=C tr -dc 'A-HJ-NPR-Za-km-z2-9' < /dev/urandom | head -c 20))"
export PUBLIC_IP="$(node getPublicIpCommand)"
# Write credentials (password and PSK) so on the next reset the credentials stay the same 
echo "$PSK" > $PSK_PATH
echo "$ADMIN_PASSWORD" > $VPN_ADMIN_PASS_PATH
echo "$PUBLIC_IP" > $PUBLIC_IP_PATH # May not be necessary to cache

# Supervisord processes:
# > /usr/src/app/init.sh (libreswan VPN, executes xl2tpd)
# > /usr/src/app/ipsec.sh (ipsec)
# > node client.js (VPN user managment API)
supervisord