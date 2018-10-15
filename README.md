
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
yarn global add lerna
lerna bootstrap
```
4. Build the entire app and run the tests:
```bash
lerna run build
lerna run test
```

## Environment
This app is intended to be friendly to all-manner of environments. It
requires a postgres database to be available.

### Webserver Configuration
The API uses Koa as a webserver.

#### Optional Environment Variables
- `PORT: number`
  - default: `8081`
  - The port on which to listen for inbound http requests.

### Database/ORM/Postgres Configuration
The API uses typeorm to connect to postgres. The following environment
variables are used to configure that connection.

#### Optional Environment Variables
- `DATABASE_URL: string`
  - Default: `undefined`
  - Included for heroku support.
  - Something like `postgres://username:password@host:port/database`
  - username, password, host, port, database must be present in the string.
  - Overrides `cch2018_orm_{username,password,host,port,database}` if set.
- `cch2018_orm_username: string`
  - Default: `"halloween2018"`
- `cch2018_orm_password: string`
  - Default: `"halloween-password"`
- `cch2018_orm_host`
  - Default: `"localhost"`
- `cch2018_orm_database`
  - Default: `"halloween2018"`
- `cch2018_orm_synchronize`
  - Default: `false`
  - If set to true, a (potentially destructive) update will be done to the database in order to make it conform with entity schemas. Should never be used in production.

### Deviantart API client configuration
The Deviantart oauth api is used to authenticate users. 
`authorization_grant` workflow is used, so a `client_secret` is necessary.

#### Required Environment Variables
- `cch2018_da_client_id: number`
  - The `client_id` of the deviantart oauth application.
- `cch2018_da_client_secret: string`
  - The `client_secret` of the deviantart oauth application.

### Optional Environment Variables
- `cch2018_da_oauth_endpoint: string`
  - Default: `"https://www.deviantart.com/oauth2/token"`
  - The `token` endpoint to complete the `authorization_grant` workflow.
- `cch2018_da_base_route: string`
  - Default: `https://www.deviantart.com/api/v1/oauth2/`
  - This must include a trailing slash.

### Token Configuration
The API authenticates clients using [https://jwt.io](JSON Web Tokens).

#### Required Environment Variables
- `cch2018_token_secret: string`
  - The secret to use when the API signs a JWT bearer token.
  - Should be some secure random secret.
