FROM node:14-alpine

RUN apk add --no-cache \
    libc6-compat \
    libstdc++ \
    && addgroup app \
    && adduser -S -G app app    

USER app

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

CMD [ "npm", "start" ]

