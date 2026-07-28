FROM node:24-alpine3.22 AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Packages are necessary to run c-compiled apps (e.g. OLC) on Alpine.
RUN apk add --no-cache \
    libc6-compat \
    libstdc++

WORKDIR /home/node/app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS development

COPY . .
RUN chmod a+x ./wait-for \
    ./docker-entrypoint.sh \
    ./igc/olc_lnx \
    ./igc/olc_mac_arm \
    ./igc/olc_lnx_arm

USER node
ENTRYPOINT ["/bin/sh", "./docker-entrypoint.sh"]

FROM base AS build

COPY . .
RUN pnpm run build \
    && pnpm prune --prod

FROM node:24-alpine3.22 AS production

ENV NODE_ENV="production"

RUN apk add --no-cache \
    libc6-compat \
    libstdc++

WORKDIR /home/node/app

COPY --from=build --chown=node:node /home/node/app/node_modules ./node_modules
COPY --from=build --chown=node:node /home/node/app/dist ./dist
COPY --from=build --chown=node:node /home/node/app/package.json ./
COPY --from=build --chown=node:node /home/node/app/wait-for ./
COPY --from=build --chown=node:node /home/node/app/docker-entrypoint.sh ./
COPY --from=build --chown=node:node /home/node/app/igc/olc* ./igc/

RUN chmod a+x ./wait-for \
    ./docker-entrypoint.sh \
    ./igc/olc_lnx \
    ./igc/olc_mac_arm \
    ./igc/olc_lnx_arm \
    && mkdir -p ./data/logs ./igc/flights \
    && chown -R node:node /home/node/app

USER node
ENTRYPOINT ["/bin/sh", "./docker-entrypoint.sh"]

FROM production AS ci

ENV NODE_ENV="CI"

COPY --from=build --chown=node:node /home/node/app/test/testdatasets ./dist/test/testdatasets
RUN ln -s ./dist/test ./test

FROM production AS final
