
[![Build Status](https://travis-ci.com/Provinite/halloween-2018.svg?branch=dev)](https://travis-ci.com/Provinite/halloween-2018)

# Halloween - 2018
Clovercoin halloween 2018 / community appreciation day event.
  
## Technical Deets / Application Structure
### Packages/api
API service. Typescript NodeJS Koa server powered by Awilix, and postgresql via typeorm. Deployed out to heroku.

### Packages/web-client
Responsive web client, consumes `api`. Typescript React app, Deployed out to the clovercoin website.
