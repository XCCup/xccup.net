FROM node:14-alpine

# Packages are necesseary to run c-compiled apps (e.g. OLC) on alpine
# TODO: Replace compiled app through usage of Node’s N-API
RUN apk add --no-cache \
    libc6-compat \
    libstdc++ 

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json ./

USER node
RUN npm install
COPY --chown=node:node . .
RUN chmod +x ./igc/olc_lnx && chmod +x ./igc/olc_lnx_arm

CMD [ "node", "app.js" ]
