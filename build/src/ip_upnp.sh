#!/bin/sh

export IMAGE=$(docker inspect ${HOSTNAME} -f '{{.Config.Image}}')
export ExternalIP=$(docker run --rm --net=host ${IMAGE} upnpc -l | awk -F'= '  '/ExternalIPAddress/{print $2}')
export InternalIP=$(docker run --rm --net=host ${IMAGE} ip route get 1  | sed -n 's/.*src \([0-9.]\+\).*/\1/p')
 
echo "$ExternalIP" > $EXTERNAL_IP_PATH 
echo "$InternalIP" > $INTERNAL_IP_PATH

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

# Test PUBLIC_IP resolution
PUBLIC_IP_RESOLVED=0
count=10
max=3
i=0

while [ "$i" -lt $max ] && [ "$PUBLIC_IP_RESOLVED" == 0 ]
do
  ping -c $count $PUBLIC_IP
  if [ $? -eq 0 ]
  then
    PUBLIC_IP_RESOLVED=1
  fi
  echo "count $i"
  i=$(($i + 1))
done

echo "$PUBLIC_IP_RESOLVED" > $PUBLIC_IP_RESOLVED_PATH


