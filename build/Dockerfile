# Smallest base image
FROM node:8.14.0-alpine

RUN apk add --update wget openvpn iptables bash easy-rsa \
    bind-tools supervisor miniupnpc docker openssl jq sed && \
    ln -s /usr/share/easy-rsa/easyrsa /usr/local/bin && \
    rm -rf /tmp/* /var/tmp/* /var/cache/apk/* /var/cache/distfiles/*

# OpenVPN parameters
ENV OPENVPN /etc/openvpn
ENV EASYRSA /usr/share/easy-rsa
ENV EASYRSA_PKI $OPENVPN/pki
ENV EASYRSA_VARS_FILE $OPENVPN/vars
ENV EASYRSA_CRL_DAYS 3650
ENV EASYRSA_BATCH yes
ENV EASYRSA_ALGO ec
ENV EASYRSA_CURVE prime256v1

RUN mkdir -p /usr/src/app/secrets
# VPN management parameters
ENV DEFAULT_ADMIN_USER dappnode_admin
ENV OPENVPN_CONF $OPENVPN/openvpn.conf
ENV OPENVPN_ADMIN_PROFILE $OPENVPN/pki/issued/$DEFAULT_ADMIN_USER.crt
ENV OPENVPN_CRED_DIR /var/spool/openvpn
ENV OPENVPN_CCD_DIR $OPENVPN/ccd
ENV OPENVPN_CRED_PORT 8080
ENV DB_PATH /usr/src/app/secrets/vpndb.json
ENV LOGIN_MSG_PATH /usr/src/app/loginMsgFile.txt
ENV INSTALLATION_STATIC_IP /usr/src/app/config/static_ip
ENV KEYPAIR_PATH /usr/src/app/secrets/keypair
ENV PUBLIC_IP_PATH /usr/src/app/secrets/server-ip
ENV SERVER_NAME_PATH /etc/vpnname
ENV INTERNAL_IP_PATH /usr/src/app/secrets/internal-ip
ENV EXTERNAL_IP_PATH /usr/src/app/secrets/external-ip
ENV PUBLIC_IP_RESOLVED_PATH /usr/src/app/secrets/public-ip_resolved
ENV DYNDNS_HOST https://ns.dappnode.io
ENV PUBLIC_IP_URL https://ns.dappnode.io/myip
ENV DYNDNS_DOMAIN dyndns.dappnode.io

WORKDIR /usr/src/app
COPY src/package.json .
RUN npm install
# Add the project afterwards for caching
COPY src .

VOLUME ["/etc/openvpn"]

# Internally uses port 1194/udp, remap using `docker run -p 443:1194/tcp`
EXPOSE 1194/udp

RUN ln -s /usr/src/app/src/vpncli.js /usr/local/bin/vpncli
ADD ./bin /usr/local/bin
RUN chmod a+x /usr/local/bin/*

# Supervisor run:
# node src/client.js
# ovpn_run
CMD ["supervisord","-c","supervisord.conf"]
