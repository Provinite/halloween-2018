# Halloween 2018 API - /src/
Source root. All *.spec.ts files will be picked up for testing, all *.ts files (excluding specs)
will be built.

| Path | Contents |
| ---  | ---      |
| [/src/config/](./config) | Bootsrapping and setup-related configuration classes. Includes things like database connection and webserver configuration. |
| [/src/controllers/](./controllers/) | Application controllers. |
| [/src/middlewares/](./middlewares/) | Middleware factorries that interface directly with Koa. Things like request routing and JSON marshalling. |
| [/src/models/](./models/) | Typeorm entities |
| [/src/reflection/](./reflection) | Decorators and metaprogramming support. Includes things like @Component, @Route, @Controller decorators as well as module path scanning. |
| AwilixHelpers.ts | Utils for interacting with Awilix |
| HalloweenAppDevRunner.ts | Dev environment application entry point |
| HalloweenAppRunner.ts | Interface for application entry points |
| app.ts | Actual application entry point |

