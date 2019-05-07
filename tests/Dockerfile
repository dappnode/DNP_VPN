FROM vpn.dnp.dappnode.eth:int-test-base

COPY tests tests

ENV NODE_ENV dev

RUN yarn upgrade && \
    yarn global add mocha chai

CMD ["mocha", "test/client.test.int.js", "--reporter", "spec"]
