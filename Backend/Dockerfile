FROM node:14-alpine

# Why?
RUN apk add --no-cache \
    libc6-compat \
    libstdc++ 

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package*.json ./

USER node
RUN npm install
COPY --chown=node:node . .
RUN chmod +x ./igc/olc_lnx

CMD [ "node", "app.js" ]
