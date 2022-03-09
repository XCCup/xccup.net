FROM nginx:1.21.4-alpine
#RUN addgroup app && adduser -S -G app app
#USER app
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY ./data /usr/share/nginx/html
EXPOSE 80
ENTRYPOINT [ "nginx", "-g", "daemon off;" ]