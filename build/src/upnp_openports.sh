#!/bin/sh   

export IMAGE=$(docker inspect DAppNodeCore-vpn.dnp.dappnode.eth -f '{{.Config.Image}}')
    
# Delete UPnP Ports
docker run --rm --net=host ${IMAGE} upnpc -e DAppNode -d 500 UDP
docker run --rm --net=host ${IMAGE} upnpc -e DAppNode -d 4500 UDP
docker run --rm --net=host ${IMAGE} upnpc -e DAppNode -d 22 TCP
docker run --rm --net=host ${IMAGE} upnpc -e DAppNode -d 30303 UDP
docker run --rm --net=host ${IMAGE} upnpc -e DAppNode -d 30303 TCP
docker run --rm --net=host ${IMAGE} upnpc -e DAppNode -d 4001 TCP
docker run --rm --net=host ${IMAGE} upnpc -e DAppNode -d 4002 UDP
# Open UPnP Ports
## VPN
docker run --rm --net=host ${IMAGE} upnpc -e DAppNode -r 500 UDP
docker run --rm --net=host ${IMAGE} upnpc -e DAppNode -r 4500 UDP
## SSH
#docker run --rm --net=host ${IMAGE} upnpc -e DAppNode -r 22 TCP
## Ethereum Node
docker run --rm --net=host ${IMAGE} upnpc -e DAppNode -r 30303 UDP
docker run --rm --net=host ${IMAGE} upnpc -e DAppNode -r 30303 TCP
## IPFS Node
docker run --rm --net=host ${IMAGE} upnpc -e DAppNode -r 4001 TCP
docker run --rm --net=host ${IMAGE} upnpc -e DAppNode -r 4002 UDP
