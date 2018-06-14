#!/bin/sh

while ! [ -f /var/run/dnp_vpn ];
do
    sleep 1
done
echo "/var/run/dnp_vpn found! Starting ipsec"
exec ipsec restart --config /etc/ipsec.conf