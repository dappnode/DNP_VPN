#!/bin/sh
#
# Docker script to configure and start an IPsec VPN server
#
# DO NOT RUN THIS SCRIPT ON YOUR PC OR MAC! THIS IS ONLY MEANT TO BE RUN
# IN A DOCKER CONTAINER!
#
# This file is part of IPsec VPN Docker image, available at:
# https://github.com/hwdsl2/docker-ipsec-vpn-server
#
# Copyright (C) 2016-2017 Lin Song <linsongui@gmail.com>
# Based on the work of Thomas Sarlandie (Copyright 2012)
#
# This work is licensed under the Creative Commons Attribution-ShareAlike 3.0
# Unported License: http://creativecommons.org/licenses/by-sa/3.0/
#
# Attribution required: please include my name in any derivative and let me
# know how you have improved it!

export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

exiterr()  { echo "Error: $1" >&2; exit 1; }

check_ip() {
  IP_REGEX='^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$'
  printf '%s' "$1" | tr -d '\n' | grep -Eq "$IP_REGEX"
}

echo 'Trying to auto discover IP of this server...'

# In case auto IP discovery fails, manually define the public IP
# of this server in your 'env' file, as variable 'VPN_PUBLIC_IP'.
PUBLIC_IP=${VPN_PUBLIC_IP:-''}

# Try to auto discover IP of this server
[ -z "$PUBLIC_IP" ] && PUBLIC_IP=$(dig @resolver1.opendns.com -t A -4 myip.opendns.com +short)

# Check IP for correct format
check_ip "$PUBLIC_IP" || PUBLIC_IP=$(wget -t 3 -T 15 -qO- http://ipv4.icanhazip.com)
check_ip "$PUBLIC_IP" || exiterr "Cannot detect this server's public IP. Define it in your 'env' file as 'VPN_PUBLIC_IP'."

# Export variables for use in templates
echo "Generating VPN credentials: PSK and password..."
export VPN_USER=dappnode_admin
export VPN_PASSWORD="$(LC_CTYPE=C tr -dc 'A-HJ-NPR-Za-km-z2-9' < /dev/urandom | head -c 16)"
export VPN_IPSEC_PSK="$(LC_CTYPE=C tr -dc 'A-HJ-NPR-Za-km-z2-9' < /dev/urandom | head -c 16)"
export VPN_PASSWORD_ENC=$(openssl passwd -1 "$VPN_PASSWORD")
export L2TP_NET=${VPN_L2TP_NET:-'192.168.42.0/24'}
export L2TP_LOCAL=${VPN_L2TP_LOCAL:-'192.168.42.1'}
export L2TP_POOL=${VPN_L2TP_POOL:-'192.168.42.10-192.168.42.250'}
export XAUTH_NET=${VPN_XAUTH_NET:-'192.168.43.0/24'}
export XAUTH_POOL=${VPN_XAUTH_POOL:-'192.168.43.10-192.168.43.250'}
export DNS_SRV1=${VPN_DNS_SRV1:-'8.8.8.8'}
export DNS_SRV2=${VPN_DNS_SRV2:-'8.8.4.4'}
export PUBLIC_IP

# Create IPsec (Libreswan) config
#   ${L2TP_NET}  ${XAUTH_NET}  ${XAUTH_POOL}  ${DNS_SRV1}  ${DNS_SRV2}  ${PUBLIC_IP}
envsubst < "ipsec.conf" > "/etc/ipsec.conf"
# Specify IPsec PSK
#   ${VPN_IPSEC_PSK}
envsubst < "ipsec.secrets" > "/etc/ipsec.secrets"
# Create xl2tpd config
#   ${L2TP_POOL}  ${L2TP_LOCAL}
envsubst < "xl2tpd.conf" > "/etc/xl2tpd/xl2tpd.conf"
# Set xl2tpd options
#   ${DNS_SRV1}  ${DNS_SRV2}
envsubst < "options.xl2tpd" > "/etc/ppp/options.xl2tpd"
# Create VPN credentials
#   ${VPN_USER}  ${VPN_PASSWORD}
envsubst < "chap-secrets" > "/etc/ppp/chap-secrets"
# Create passwd
#   ${VPN_USER}  ${VPN_PASSWORD_ENC}
envsubst < "passwd" > "/etc/ipsec.d/passwd"
# Output the IP for the user managment UI
echo "WRITING PUBLIC IP TO SERVER-IP"
echo "$PUBLIC_IP" > "/etc/server-ip"
echo "WRITING PSK TO SERVER-PSK"
echo "$VPN_IPSEC_PSK" > "/etc/server-psk"

# Update sysctl settings
SYST='/sbin/sysctl -e -q -w'
if [ "$(getconf LONG_BIT)" = "64" ]; then
  SHM_MAX=68719476736
  SHM_ALL=4294967296
else
  SHM_MAX=4294967295
  SHM_ALL=268435456
fi
$SYST kernel.msgmnb=65536
$SYST kernel.msgmax=65536
$SYST kernel.shmmax=$SHM_MAX
$SYST kernel.shmall=$SHM_ALL
$SYST net.ipv4.ip_forward=1
$SYST net.ipv4.conf.all.accept_source_route=0
$SYST net.ipv4.conf.all.accept_redirects=0
$SYST net.ipv4.conf.all.send_redirects=0
$SYST net.ipv4.conf.all.rp_filter=0
$SYST net.ipv4.conf.default.accept_source_route=0
$SYST net.ipv4.conf.default.accept_redirects=0
$SYST net.ipv4.conf.default.send_redirects=0
$SYST net.ipv4.conf.default.rp_filter=0
$SYST net.ipv4.conf.eth0.send_redirects=0
$SYST net.ipv4.conf.eth0.rp_filter=0

# Create IPTables rules
iptables -I INPUT 1 -p udp --dport 1701 -m policy --dir in --pol none -j DROP
iptables -I INPUT 2 -m conntrack --ctstate INVALID -j DROP
iptables -I INPUT 3 -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
iptables -I INPUT 4 -p udp -m multiport --dports 500,4500 -j ACCEPT
iptables -I INPUT 5 -p udp --dport 1701 -m policy --dir in --pol ipsec -j ACCEPT
iptables -I INPUT 6 -p udp --dport 1701 -j DROP
iptables -I FORWARD 1 -m conntrack --ctstate INVALID -j DROP
iptables -I FORWARD 2 -i eth+ -o ppp+ -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
iptables -I FORWARD 3 -i ppp+ -o eth+ -j ACCEPT
iptables -I FORWARD 4 -i ppp+ -o ppp+ -s "$L2TP_NET" -d "$L2TP_NET" -j ACCEPT
iptables -I FORWARD 5 -i eth+ -d "$XAUTH_NET" -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
iptables -I FORWARD 6 -s "$XAUTH_NET" -o eth+ -j ACCEPT
# Uncomment if you wish to disallow traffic between VPN clients themselves
# iptables -I FORWARD 2 -i ppp+ -o ppp+ -s "$L2TP_NET" -d "$L2TP_NET" -j DROP
# iptables -I FORWARD 3 -s "$XAUTH_NET" -d "$XAUTH_NET" -j DROP
iptables -A FORWARD -j DROP
iptables -t nat -I POSTROUTING -s "$XAUTH_NET" -o eth+ -m policy --dir out --pol none -j MASQUERADE
iptables -t nat -I POSTROUTING -s "$L2TP_NET" -o eth+ -j MASQUERADE

# Update file attributes
chmod 600 /etc/ipsec.secrets /etc/ppp/chap-secrets /etc/ipsec.d/passwd

cat <<EOF

================================================

IPsec VPN server is now ready for use!

Connect to your new VPN with these details:

Server IP: $PUBLIC_IP
IPsec PSK: $VPN_IPSEC_PSK
Username: $VPN_USER
Password: $VPN_PASSWORD

Write these down. You'll need them to connect!

================================================

EOF

# Load IPsec NETKEY kernel module
modprobe af_key

# Start services
mkdir -p /var/run/pluto /var/run/xl2tpd
rm -f /var/run/pluto/pluto.pid /var/run/xl2tpd.pid

ipsec start --config /etc/ipsec.conf

# Initialize xl2tpd in the background
echo "#### EXECUTING LIBRESWAN"
exec /usr/sbin/xl2tpd -D -c /etc/xl2tpd/xl2tpd.conf



