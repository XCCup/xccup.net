# xccup.net frontend

## Project setup

```
pnpm install
```

### Compiles and hot-reloads for development

```
docker compose up
```

### Compiles and minifies for production

```
docker compose run --rm yarn build
```

Find the rollup bundle stats at stats.html after build

# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended IDE Setup

- [VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=johnsoncodehk.volar)

# Cypress

## Howto connect to cypress within WSL

https://nickymeuleman.netlify.app/blog/gui-on-wsl2-cypress

## Howto skip local install of Cypress binary 

```
CYPRESS_INSTALL_BINARY=0 pnpm install
```