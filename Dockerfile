FROM node:14

WORKDIR /app

ARG HELMFILE_VERSION=v0.135.0

ADD https://github.com/roboll/helmfile/releases/download/${HELMFILE_VERSION}/helmfile_linux_amd64 \
    /tmp/

COPY . .

RUN npm install \
    && mv /tmp/helmfile_linux_amd64 /usr/local/bin/helmfile \
    && chmod +x /usr/local/bin/helmfile

ENTRYPOINT [ "node", "/app/src/index.js" ]
