# BUILD #
FROM node:8.14.0-alpine as build

WORKDIR /usr/src/app

RUN apk add --update --no-cache \
    build-base python docker git libpcap-dev linux-headers bash jq

COPY build/src/package.json ./
COPY build/src/yarn.lock ./
# Note: npm package `eth-crypto` added size is 62MB
RUN yarn install --production
# Reduces the app dir size from 94.5MB to 71.8MB
RUN npm config set unsafe-perm true
RUN yarn global add modclean && modclean -r
# Run the copy in two steps to cache the npm install
COPY build/src .

# Get this DNP version and git hash. Results in /usr/src/app/.version.json
ADD .git .git
ADD dappnode_package.json .
RUN ./getVersionData.sh

# BASE #
# Smallest base image
FROM node:8.14.0-alpine

WORKDIR /usr/src/app

RUN apk add --update \
    openvpn \
    iptables \ 
    bash \
    easy-rsa \ 
    supervisor \
    miniupnpc \
    openssl \
    jq \
    sed
RUN ln -s /usr/share/easy-rsa/easyrsa /usr/local/bin && \
    rm -rf /tmp/* /var/tmp/* /var/cache/apk/* /var/cache/distfiles/*

# (Docker) Necessary dependencies
RUN apk add --no-cache libltdl
RUN ALPINE_GLIBC_BASE_URL="https://github.com/sgerrand/alpine-pkg-glibc/releases/download" && \
    ALPINE_GLIBC_PACKAGE_VERSION="2.28-r0" && \
    ALPINE_GLIBC_BASE_PACKAGE_FILENAME="glibc-$ALPINE_GLIBC_PACKAGE_VERSION.apk" && \
    ALPINE_GLIBC_BIN_PACKAGE_FILENAME="glibc-bin-$ALPINE_GLIBC_PACKAGE_VERSION.apk" && \
    ALPINE_GLIBC_I18N_PACKAGE_FILENAME="glibc-i18n-$ALPINE_GLIBC_PACKAGE_VERSION.apk" && \
    apk add --no-cache --virtual=.build-dependencies wget ca-certificates && \
    wget -nv \
        "https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub" \
        -O "/etc/apk/keys/sgerrand.rsa.pub" && \
    wget -nv \
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
# (end docker)

RUN mkdir -p /usr/src/app/secrets

# ENVs used in other ENV statements
ENV OPENVPN=/etc/openvpn \
    DEFAULT_ADMIN_USER=dappnode_admin

# OpenVPN parameters
ENV EASYRSA=/usr/share/easy-rsa \
    EASYRSA_PKI=$OPENVPN/pki \
    EASYRSA_VARS_FILE=$OPENVPN/vars \
    EASYRSA_CRL_DAYS=3650 \
    EASYRSA_BATCH=yes \
    EASYRSA_ALGO=ec \
    EASYRSA_CURVE=prime256v1 \
# VPN management parameters - OpenVPN params
    DEFAULT_ADMIN_USER=dappnode_admin \
    OPENVPN_CONF=$OPENVPN/openvpn.conf \
    OPENVPN_ADMIN_PROFILE=$OPENVPN/pki/issued/$DEFAULT_ADMIN_USER.crt \
    OPENVPN_CRED_DIR=/var/spool/openvpn \
    OPENVPN_CCD_DIR=$OPENVPN/ccd \
    OPENVPN_CRED_PORT=8090 \
# VPN management parameters - Node paths
    DB_PATH=/usr/src/app/secrets/vpndb.json \
    LOGIN_MSG_PATH=/usr/src/app/secrets/loginMsgFile.txt \
    INSTALLATION_STATIC_IP=/usr/src/app/config/static_ip \
    KEYPAIR_PATH=/usr/src/app/secrets/keypair \
    PUBLIC_IP_PATH=/usr/src/app/secrets/server-ip \
    SERVER_NAME_PATH=/etc/vpnname \
    INTERNAL_IP_PATH=/usr/src/app/secrets/internal-ip \
    EXTERNAL_IP_PATH=/usr/src/app/secrets/external-ip \
    PUBLIC_IP_RESOLVED_PATH=/usr/src/app/secrets/public-ip_resolved \
# VPN management parameters - URLs
    DYNDNS_HOST=https://ns.dappnode.io \
    DYNDNS_DOMAIN=dyndns.dappnode.io \
# Used for v2 updates
    CHAP_SECRETS_PATH=/usr/src/app/secrets/chap-secrets

RUN mkdir -p ${OPENVPN_CRED_DIR} ${OPENVPN_CCD_DIR}

COPY --from=build /usr/src/app /usr/src/app
COPY --from=build /usr/bin/docker /usr/bin/docker

VOLUME ["/etc/openvpn"]

# Internally uses port 1194/udp, remap using `docker run -p 443:1194/tcp`
EXPOSE 1194/udp

RUN ln -s /usr/src/app/src/getAdminCredentials.js /usr/local/bin/getAdminCredentials && \
    ln -s /usr/src/app/src/migrateOldUsers.js /usr/local/bin/migrateOldUsers && \
    ln -s /usr/src/app/src/vpncli.js /usr/local/bin/vpncli

ADD build/bin /usr/local/bin

# Use CMD so it can be replaced when using the VPN image for upnpc calls
# Will setup the app, initialize variables and then call supervisord
# Supervisor runs:
# - node src/index.js
# - ovpn_run
CMD ["./entrypoint.sh"]
