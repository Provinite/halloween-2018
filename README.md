
[![Build Status](https://travis-ci.com/Provinite/halloween-2018.svg?branch=dev)](https://travis-ci.com/Provinite/halloween-2018)

# Halloween - 2018
Clovercoin halloween 2018 / community appreciation day event.
  
## Technical Deets / Monorepo Structure
### [Packages/api](./packages/api)
API service. Typescript NodeJS Koa server powered by Awilix, and postgresql via typeorm. Deployed out to heroku.

### [Packages/web-client](./packages/web-client)
Responsive web client, consumes `api`. Typescript React app, Deployed out to the clovercoin website.

## Getting Started
1. Install `node` and `yarn`
2. clone down the repo
3. from the repo root, run 
```bash
yarn install
yarn add global lerna
lerna bootstrap
```
4. Build the entire app and run the tests:
```bash
lerna run build
lerna run test
```
