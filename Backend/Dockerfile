FROM node:14-alpine

RUN apk add --no-cache \
    libc6-compat \
    libstdc++ \
    && addgroup app \
    && adduser -S -G app app    

USER app

# Permission error on linux host, but why? Build nicely on MacOS
#WORKDIR /app
WORKDIR /home/app/app
COPY package*.json ./
RUN npm install
COPY . .

CMD [ "npm", "start" ]

