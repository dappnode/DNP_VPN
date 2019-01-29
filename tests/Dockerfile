FROM openvpn.dnp.dappnode.eth:0.1.1

COPY tests tests

ENV NODE_ENV dev

RUN npm update && \
    npm install -g mocha

CMD ["mocha", "tests/client.test.js", "--reporter", "spec"]

