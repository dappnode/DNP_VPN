FROM alpine

WORKDIR /usr/src/app

RUN apk add --update --no-cache \
    libreswan \
    ppp \
    xl2tpd \
    openssl \
    openrc \
    && rm -rf /var/cache/apk/* \
    && rc-status \
    && touch /run/openrc/softlevel \
    && rc-update add ipsec

COPY ipsec /etc/init.d/ipsec
COPY run.sh .
COPY VPN.mobileconfig.tpl .

EXPOSE 500/udp 4500/udp

VOLUME ["/lib/modules"]

ENTRYPOINT [ "/usr/src/app/run.sh" ]

