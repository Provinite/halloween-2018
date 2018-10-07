# Halloween 2018 REST API
Typescript Koa server.

## Development Tasks
### Build
```bash
gulp build # creates built application in dist/
```

### Dev Server
```bash
gulp serve # will spawn the api on port 8081, will autorestart on source changes
```

### Tests
Tests are powered by jest.
```bash
jest # run tests once
jest --watch # run tests in interactive mode (great for development)
```

### Lint
Needs to be added to gulp or yarn. For now, can be done with the TSLint vscode plugin, or `tslint` directly.
Linting includes prettier as a ruleset, so feel free to sit back, relax, and let the code formatting happen for you.
