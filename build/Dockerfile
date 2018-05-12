FROM alpine

WORKDIR /usr/src/app

RUN apk add --update --no-cache \
    libreswan \
    ppp \
    xl2tpd \
    openssl \
    openrc \
    bind-tools \
    build-base \
    # gettext package contains envsubst, template engine for the VPN files
    gettext \
    supervisor \
    nodejs \
    && rm -rf /var/cache/apk/* \
    && rc-status \
    && touch /run/openrc/softlevel \
    && rc-update add ipsec

# Copying source contents:
# - supervisord.conf
# - ipsec
# - VPN setup shell: init.sh, templates/
# - node files: package.json, client.js
COPY src .
COPY src/ipsec /etc/init.d/ipsec

RUN chmod 755 init.sh

# Installing node dependencies
RUN npm install

# envs for init.sh -> node communication
ENV VPN_IP_FILE_PATH /etc/server-ip
ENV VPN_PSK_FILE_PATH /etc/server-psk
ENV VPN_NAME_FILE_PATH /etc/vpnname
# location of the OTP parsing tool
ENV DAPPNODE_OTP_URL https://dappnode.github.io/DNP_VPN/DAppNode_OTP.html

RUN ln -s /usr/src/app/getAdminCredentials.js /usr/bin/getAdminCredentials
RUN chmod +x /usr/src/app/getAdminCredentials.js

# Exposing necessary ports for the VPN
EXPOSE 500/udp 4500/udp

VOLUME ["/lib/modules"]

# Supervisord processes:
# > /usr/src/app/init.sh (libreswan VPN, executes xl2tpd)
# > node client.js (VPN user managment API)
CMD ["supervisord"]

