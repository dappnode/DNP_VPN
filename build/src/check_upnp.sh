#!/bin/sh

export IMAGE=$(docker inspect DAppNodeCore-vpn.dnp.dappnode.eth -f '{{.Config.Image}}')
export EXTERNAL_IP=$(docker run --rm --net=host ${IMAGE} upnpc -l | awk -F'= '  '/ExternalIPAddress/{print $2}')
export INTERNAL_IP=$(docker run --rm --net=host ${IMAGE} ip route get 1  | sed -n 's/.*src \([0-9.]\+\).*/\1/p')
 
echo "$EXTERNAL_IP" > $EXTERNAL_IP_PATH 
echo "$INTERNAL_IP" > $INTERNAL_IP_PATH