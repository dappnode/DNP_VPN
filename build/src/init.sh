#!/bin/bash

check_ip() {
  IP_REGEX='^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$'
  printf '%s' "$1" | tr -d '\n' | grep -Eq "$IP_REGEX"
}

# Initalize UPnP
source /usr/src/app/ip_upnp.sh

# Check IP for correct format FIXME: needed?
check_ip "$PUBLIC_IP" || PUBLIC_IP=$(wget -t 3 -T 15 -qO- http://ipv4.icanhazip.com)
check_ip "$PUBLIC_IP" || exiterr "Cannot detect this server's public IP. Define it in your 'env' file as 'VPN_PUBLIC_IP'."
echo "WRITING PUBLIC IP TO SERVER-IP"
echo "$PUBLIC_IP" > $PUBLIC_IP_PATH

# Wait for database
echo "Waiting for database to be created..."
while [ ! -f ${DB_PATH} ]
do
  sleep 3
done

# Check in db if node has a static IP, use dynamic DNS domain instead.
VPNHOSTNAME=${HOSTNAME}
STATICIP=$(jq -r '.staticIp // empty' $DB_PATH)
DOMAIN=$(jq -r '.domain // empty' $DB_PATH)
if [[ ! -z $STATICIP ]]; then
    VPNHOSTNAME=${STATICIP}
elif [[ ! -z $DOMAIN ]]; then
    VPNHOSTNAME=${DOMAIN}
fi

# Initialize config and PKI 
# -c: Client to Client
# -d: disable default route (disables NAT without '-N')
# -p "route 172.33.0.0 255.255.0.0": Route to push to the client

if [ ! -e "${OPENVPN_CONF}" ]; then
    ovpn_genconfig -c -d -u udp://${VPNHOSTNAME} -s 172.33.8.0/22 \
    -p "route 172.33.0.0 255.255.0.0" \
    -n "172.33.1.2"
    EASYRSA_REQ_CN=${VPNHOSTNAME} ovpn_initpki nopass
fi

mkdir -p ${OPENVPN_CRED_DIR} ${OPENVPN_CCD_DIR}

# Create admin user
if [ ! -e "${OPENVPN_ADMIN_PROFILE}" ]; then
    easyrsa build-client-full dappnode_admin nopass
    echo "ifconfig-push 172.33.10.20 172.33.10.254" > ${OPENVPN_CCD_DIR}/dappnode_admin
fi

# Enable Proxy ARP (needs privileges)
echo 1 > /proc/sys/net/ipv4/conf/eth0/proxy_arp

# Save environment
env | sed '/affinity/d' > /etc/env.sh

/usr/local/bin/ovpn_run
