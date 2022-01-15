FROM node:16.13.2-alpine3.15

# Packages are necesseary to run c-compiled apps (e.g. OLC) on alpine
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
    && chmod a+x ./igc/olc_lnx_arm
RUN yarn install

USER node

ENTRYPOINT [ "/bin/sh", "./docker-entrypoint.sh" ]
