# Middlewares
Koa operates by passing incoming requests through middlewares in order,
constituting a chain of responsibility for all incoming requests. Check out the
Koa docs for details. In this application, middlewares are a natural place for 
cross-cutting concerns (such as security, and rendering) as well as an entry 
point for the application's business logic (eg: request routing).

## Middleware Factories
Middleware factories are used to provide closure over injectables. All middlewares
should take in their injectables in the constructor, and implement the
`IMiddlewareFactory` interface. In short, using a factory to generate the actual
middleware function lets us get consistent dependency injection outside of the
business logic code.

## Writing Middlewares
Don't forget about `await next()` to fire off additional middlewares. It's not
optional.

## The Chain
1. `AuthorizationMiddleware` - Responsible for verifying that users have
    permissions to make the requests that they are making.
1. `BodyParser` - (Not ours) Parses request bodies into JS objects.
1. `RouterMiddleware` - Responsible for routing requests to their handlers, as
    well as creating the request-scoped DI container that is used to inject args
    into those handlers. Attaches the result of the handler to `ctx.state.result`
1. `RendererMiddleware` - Responsible for rendering data stored in `ctx.state.result`.
    Basically just does a JSON transform for now.
1. `CorsMiddleware` - Responsible for managing CORS headers for requests.

## Additional Context
Middlewares are registered once at application start. See the KoaConfiguration 
service for details.