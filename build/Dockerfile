# Smallest base image
FROM node:8.14.0-alpine

RUN apk add --update wget openvpn iptables bash easy-rsa supervisor && \
    ln -s /usr/share/easy-rsa/easyrsa /usr/local/bin && \
    rm -rf /tmp/* /var/tmp/* /var/cache/apk/* /var/cache/distfiles/*

ENV OPENVPN /etc/openvpn
ENV EASYRSA /usr/share/easy-rsa
ENV EASYRSA_PKI $OPENVPN/pki
ENV EASYRSA_VARS_FILE $OPENVPN/vars
ENV EASYRSA_CRL_DAYS 3650

WORKDIR /usr/src/app
COPY src/package.json .
RUN npm install
# Add the project afterwards for caching
COPY src .

VOLUME ["/etc/openvpn"]

# Internally uses port 1194/udp, remap using `docker run -p 443:1194/tcp`
EXPOSE 1194/udp

ADD ./bin /usr/local/bin
RUN chmod a+x /usr/local/bin/*

# Supervisor run:
# node src/client.js
# ovpn_run

CMD ["supervisord"]
