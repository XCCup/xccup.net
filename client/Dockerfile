# Build Stage
FROM node:20-alpine3.19 AS build-stage
WORKDIR /app
COPY package.json package-lock ./
RUN npm install
COPY . .

RUN npm build

# Production build
FROM nginx:1.23.1-alpine
#RUN addgroup app && adduser -S -G app app
#USER app
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
ENTRYPOINT [ "nginx", "-g", "daemon off;" ]