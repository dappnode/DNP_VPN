FROM node:8.12.0-alpine as build

RUN apk add --update --no-cache \
    build-base \
    python \
    docker \
    git \
    libpcap-dev \
    linux-headers \
    bash

RUN git clone https://github.com/xelerance/xl2tpd.git && cd xl2tpd && make

WORKDIR /usr/src/app

COPY src/package*.json ./
RUN npm install
# Run the copy in two steps to cache the npm install
COPY src .

FROM alpine:3.8

WORKDIR /usr/src/app

COPY --from=build /usr/local/bin/node /usr/local/bin/node
COPY --from=build /usr/src/app /usr/src/app
COPY --from=build /usr/bin/docker /usr/bin/docker
COPY --from=build /xl2tpd/xl2tpd /usr/sbin/xl2tpd

RUN apk add --update --no-cache \
    libreswan \
    ppp \
    openssl \
    openrc \
    bind-tools \
    miniupnpc \ 
    # gettext package contains envsubst, template engine for the VPN files
    gettext \
    libltdl \
    supervisor \
    && rc-status \
    && touch /run/openrc/softlevel \
    && rc-update add ipsec \
    && ALPINE_GLIBC_BASE_URL="https://github.com/sgerrand/alpine-pkg-glibc/releases/download" && \
    ALPINE_GLIBC_PACKAGE_VERSION="2.28-r0" && \
    ALPINE_GLIBC_BASE_PACKAGE_FILENAME="glibc-$ALPINE_GLIBC_PACKAGE_VERSION.apk" && \
    ALPINE_GLIBC_BIN_PACKAGE_FILENAME="glibc-bin-$ALPINE_GLIBC_PACKAGE_VERSION.apk" && \
    ALPINE_GLIBC_I18N_PACKAGE_FILENAME="glibc-i18n-$ALPINE_GLIBC_PACKAGE_VERSION.apk" && \
    apk add --no-cache --virtual=.build-dependencies wget ca-certificates && \
    wget \
        "https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub" \
        -O "/etc/apk/keys/sgerrand.rsa.pub" && \
    wget \
        "$ALPINE_GLIBC_BASE_URL/$ALPINE_GLIBC_PACKAGE_VERSION/$ALPINE_GLIBC_BASE_PACKAGE_FILENAME" \
        "$ALPINE_GLIBC_BASE_URL/$ALPINE_GLIBC_PACKAGE_VERSION/$ALPINE_GLIBC_BIN_PACKAGE_FILENAME" \
        "$ALPINE_GLIBC_BASE_URL/$ALPINE_GLIBC_PACKAGE_VERSION/$ALPINE_GLIBC_I18N_PACKAGE_FILENAME" && \
    apk add --no-cache \
        "$ALPINE_GLIBC_BASE_PACKAGE_FILENAME" \
        "$ALPINE_GLIBC_BIN_PACKAGE_FILENAME" \
        "$ALPINE_GLIBC_I18N_PACKAGE_FILENAME" && \
    \
    rm "/etc/apk/keys/sgerrand.rsa.pub" && \
    /usr/glibc-compat/bin/localedef --force --inputfile POSIX --charmap UTF-8 "$LANG" || true && \
    echo "export LANG=$LANG" > /etc/profile.d/locale.sh && \
    \
    apk del glibc-i18n && \
    \
    rm "/root/.wget-hsts" && \
    apk del .build-dependencies && \
    rm \
        "$ALPINE_GLIBC_BASE_PACKAGE_FILENAME" \
        "$ALPINE_GLIBC_BIN_PACKAGE_FILENAME" \
        "$ALPINE_GLIBC_I18N_PACKAGE_FILENAME"

# Copying source contents:
# - supervisord.conf
# - ipsec
# - VPN setup shell: init.sh, templates/
# - node files: package.json, client.js
COPY src/ipsec /etc/init.d/ipsec

RUN chmod 755 init.sh

RUN mkdir -p /usr/src/app/secrets
# envs for init.sh -> node communication
ENV DB_PATH /usr/src/app/secrets/vpndb.json
ENV LOGIN_MSG_PATH /usr/src/app/loginMsgFile.txt
ENV INSTALLATION_STATIC_IP /usr/src/app/config/static_ip
ENV KEYPAIR_PATH /usr/src/app/secrets/keypair
ENV CREDENTIALS_PATH /usr/src/app/secrets/chap-secrets
ENV PUBLIC_IP_PATH /usr/src/app/secrets/server-ip
ENV PSK_PATH /usr/src/app/secrets/server-psk
ENV SERVER_NAME_PATH /etc/vpnname
ENV VPN_ADMIN_PASS_PATH /usr/src/app/secrets/admin-pass
ENV VPN_DNS_SRV1 172.33.1.2
ENV VPN_DNS_SRV2 8.8.8.8

# location of the OTP parsing tool
ENV DAPPNODE_OTP_URL http://otp.dappnode.io
# dyndns host
ENV DYNDNS_HOST https://ns.dappnode.io
ENV DYNDNS_DOMAIN dyndns.dappnode.io

RUN ln -s /usr/src/app/src/getAdminCredentials.js /usr/bin/getAdminCredentials
RUN chmod +x /usr/src/app/src/getAdminCredentials.js

# Supervisord processes:
# > /usr/src/app/init.sh (libreswan VPN, executes xl2tpd)
# > /usr/src/app/ipsec.sh (ipsec)
# > node client.js (VPN user managment API)
CMD ["supervisord"]
