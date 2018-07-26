#!/bin/sh

export IMAGE=$(docker inspect DAppNodeCore-vpn.dnp.dappnode.eth -f '{{.Config.Image}}')
export ExternalIP=$(docker run --rm --net=host ${IMAGE} upnpc -l | awk -F'= '  '/ExternalIPAddress/{print $2}')
export InternalIP=$(docker run --rm --net=host ${IMAGE} ip route get 1  | sed -n 's/.*src \([0-9.]\+\).*/\1/p')
 
echo "$ExternalIP" > $EXTERNAL_IP_FILE_PATH 
echo "$InternalIP" > $INTERNAL_IP_FILE_PATH