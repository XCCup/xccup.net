FROM node:22-alpine3.19

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# Remove next line if corepack version was updated in node:22 image
# RUN corepack enable
RUN corepack disable && npm install -g pnpm@latest 

# Packages are necessary to run c-compiled apps (e.g. OLC) on alpine
# TODO: Replace compiled app through usage of Node’s N-API
RUN apk add --no-cache \
    libc6-compat \
    libstdc++ 

# This is mandatory or the server chrashes. But why exactly?
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY . .
RUN mkdir -p ./igc/flights \
    && chmod a+wx ./igc/flights \
    && chmod a+x ./igc/olc_lnx \
    && chmod a+x ./igc/olc_mac_arm \
    && chmod a+x ./igc/olc_lnx_arm
RUN pnpm install

USER node

ENTRYPOINT [ "/bin/sh", "./docker-entrypoint.sh" ]
