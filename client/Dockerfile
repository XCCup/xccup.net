FROM node:20-alpine3.19 AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# Remove next line if corepack version was updated in node:20 image
# RUN corepack enable
RUN corepack disable && npm install -g pnpm@latest 
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

# Production build
FROM nginx:1.23.1-alpine
#RUN addgroup app && adduser -S -G app app
#USER app
COPY ./nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
ENTRYPOINT [ "nginx", "-g", "daemon off;" ]