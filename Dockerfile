FROM node:14

WORKDIR /app

ARG HELMFILE_VERSION='v0.135.0'
ARG HELM_PLUGIN_PATH='/opt/helm/plugins'

# Default path is in current user home directory, which is mounted by github action,
# hence using different path
ENV HELM_PLUGINS=${HELM_PLUGIN_PATH}

ADD https://github.com/roboll/helmfile/releases/download/${HELMFILE_VERSION}/helmfile_linux_amd64 \
    /tmp/

COPY . .

RUN npm install \
    && mv /tmp/helmfile_linux_amd64 /usr/local/bin/helmfile \
    && chmod +x /usr/local/bin/helmfile \
    && curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash \
    && apt-get update \
    # sudo is needed by helm plugin install
    && apt-get install sudo

# Install helm plugins here
RUN mkdir -p ${HELM_PLUGIN_PATH} \
    && helm plugin install https://github.com/zendesk/helm-secrets \
    # copy must be executed as last command in order to copy all plugins it ${HELM_PLUGIN_PATH}
    && cp -r /root/.cache/helm/plugins/* /opt/helm/plugins/

ENTRYPOINT [ "node", "/app/src/index.js" ]
