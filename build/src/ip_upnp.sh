#!/bin/sh

export IMAGE=$(docker inspect DAppNodeCore-vpn.dnp.dappnode.eth -f '{{.Config.Image}}')
export ExternalIP=$(docker run --rm --net=host ${IMAGE} upnpc -l | awk -F'= '  '/ExternalIPAddress/{print $2}')
export InternalIP=$(docker run --rm --net=host ${IMAGE} ip route get 1  | sed -n 's/.*src \([0-9.]\+\).*/\1/p')
 
echo "$ExternalIP" > $EXTERNAL_IP_FILE_PATH 
echo "$InternalIP" > $INTERNAL_IP_FILE_PATH

#DIG checkin in the future we want to remove this centralization point 
export DIG_IP=$(dig @resolver1.opendns.com -t A -4 myip.opendns.com +short)

if [ -z "$DIG_IP" ]; then
    if [ -z "$ExternalIP" ]; then
        export PUBLIC_IP=$InternalIP
    else
        export PUBLIC_IP=$ExternalIP
    fi
# NO UPNP Device
elif [ -z "$ExternalIP" ]; then
    # If interal and dig is the same directly exposed to internet
    # If is different we use the dig resolution
    if [ "$InternalIP" == "$DIG_IP" ]; then
        export PUBLIC_IP=$InternalIP
    else
        export PUBLIC_IP=$DIG_IP
    fi
# If both IP are the same every thing is OK
elif [ "$InternalIP" == "$DIG_IP" ]; then 
    export PUBLIC_IP=$ExternalIP
# In case of doubt we use the IP resolution through dig
else
    export PUBLIC_IP=$DIG_IP
fi

#UPNP Device
if [ ! -z "$ExternalIP" ]; then 
    /usr/src/app/upnp_openports.sh &
fi
