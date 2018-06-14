#!/bin/sh

while ! [ -f /var/run/dnp_vpn ];
do
    sleep 1
done
echo "/var/run/dnp_vpn found! Starting ipsec"

while sleep 5; do
    ipsec status 2>&1 >/dev/null || ipsec restart --config /etc/ipsec.conf
done