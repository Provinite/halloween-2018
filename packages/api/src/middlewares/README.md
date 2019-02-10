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
Don't forget about `await next()` to fire off additional middlewares. It's not optional.

## The Chain
1. `BodyParser` - (Not ours) Parses request bodies into JS objects.
1. `CorsMiddleware` - Responsible for managing CORS headers for requests.
    1. Expects a downstream middleware to set the "Allow" header that can be copied into `Access-Control-Allow-Methods`.
    1. Sets headers after `await next()`, so it gets last say by going early here.
1. `RequestContainerMiddleware` - Responsible for creating the request-scoped DI container.
    1. Creates a child from the root DI container.
    1. Registers the Koa context to the container.
    1. Overwrites "container" in the child container to reference the newly created request-scoped container.
    1. Invokes the requestParsingService to populate request information into the container.
1. `RenderMiddleware` - Responsible for rendering JSON responses.
    1. Renders `ctx.state.result` after `await next()` so it goes early in the chain here.
1. `ErrorHandlerMiddleware` - Wraps all middlewares from here down in a `try / catch`
    1. Allows downstream middlewares to safely throw errors and have them gracefully converted to error responses.
    1. Contains a list of known error classes that have special handling logic. Definitely consult this file before throwing an error.
1. `AuthorizationMiddleware` - Responsible for verifying that users have
    permissions to make the requests that they are making.
    1. Checks the master route registry for allowed roles on the given route
    1. Reads the token (if any) from the request, and authenticates it with the authenticationService.
        1. If no token, allow only if "public" role is allowed
    1. Fetches the associated user.
        1. Fails the request if the user is not found.
    1. If the user is not allowed, throws a PermissionDeniedError with an informative message. This message includes the entire list of allowed roles, so it should not be given to the end user.
    1. Registers the current user in the request DI container.
1. `RouterMiddleware` - Responsible for routing requests to their handlers
    1. Responsible for populating `ctx.state.result` with the return value of a request handler.

## Additional Context
Middlewares are registered once at application start. See the KoaConfiguration 
service for details.