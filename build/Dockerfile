FROM alpine

WORKDIR /usr/src/app

RUN apk add --update --no-cache \
    libreswan \
    ppp \
    xl2tpd \
    openssl \
    openrc \
    bind-tools \
    gettext \
    supervisor \
    nodejs \
    && rm -rf /var/cache/apk/* \
    && rc-status \
    && touch /run/openrc/softlevel \
    && rc-update add ipsec

# Copying source contents:
# - supervisord.conf
# - VPN templates
# - package.json, client.js
COPY src .
COPY src/ipsec /etc/init.d/ipsec

RUN chmod 755 init.sh

# Installing node dependencies + setting envs for crossbar communication
RUN npm install
ENV CBURL ws://my.wamp.dnp.dappnode.eth:8080/ws
ENV CBREALM realm1

# Exposing necessary ports for the VPN
EXPOSE 500/udp 4500/udp

# ???
VOLUME ["/lib/modules"]

# Supervisord is a process manager that would run two commands:
# > /usr/src/app/init.sh
# > node client.js
CMD ["supervisord"]
