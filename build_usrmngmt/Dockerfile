FROM node:8


WORKDIR /opt/src

COPY package.json package.json
RUN npm install \
  && npm cache clean --force


COPY client.js client.js
ENV CBURL ws://crossbar:8080/ws
ENV CBREALM realm1

# For debuging purposes. Delete in production
RUN apt-get update && apt-get install -y nano

EXPOSE 8080:8080

VOLUME ["/lib/modules", "/etc/"]

CMD ["npm", "start"]
