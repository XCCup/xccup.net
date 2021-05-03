FROM node:14-alpine

RUN apk add --no-cache \
    libc6-compat \
    libstdc++

RUN addgroup app && adduser -S -G app app
USER app

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 80

CMD [ "npm", "start" ]

