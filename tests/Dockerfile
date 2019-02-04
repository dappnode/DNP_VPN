FROM vpn.dnp.dappnode.eth:int-test-base

COPY tests tests

ENV NODE_ENV dev

RUN npm update && \
    npm install -g mocha

CMD ["mocha", "test/client.test.int.js", "--reporter", "spec"]
