import { asValue, AwilixContainer } from "awilix";
import { Context, Middleware } from "koa";
import { getMethod, HttpMethod } from "../HttpMethod";
import { MethodNotSupportedError } from "../web/MethodNotSupportedError";
import { RouteRegistry } from "../web/RouteRegistry";
import { UnknownMethodError } from "../web/UnknownMethodError";
import { UnknownRouteError } from "../web/UnknownRouteError";
import { IMiddlewareFactory } from "./IMiddlewareFactory";
import { INextCallback } from "./INextCallback";

/**
 * Middleware factory that provides a routing middleware. The created
 * middleware will examine incoming requests, map them to the proper route
 * handler, and use the request-scoped DI container to invoke that handler.
 * Depends on ctx.state.requestContainer being set.
 */
export class RouterMiddlewareFactory implements IMiddlewareFactory {
  /**
   * @param routeRegistry - The route registry to use when mapping requests.
   */
  constructor(private routeRegistry: RouteRegistry) {}
  /**
   * Create the router middleware.
   */
  create(): Middleware {
    return async (ctx: Context, next: INextCallback) => {
      const path: string = ctx.path;
      const method: HttpMethod = getMethod(ctx.method);
      if (!method) {
        throw new UnknownMethodError();
        // https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
        // 10.5.2 501 Not Implemented
        // "The server does not support the functionality required to fulfill
        // the request. This is the appropriate response when the server does
        // not recognize the request method and is not capable of supporting it
        // for any resource."
        ctx.state.result = `${ctx.method}`;
        ctx.status = 501;
      }

      // Create the request-scoped DI container
      const requestContainer: AwilixContainer = ctx.state.requestContainer;

      const {
        resolver,
        pathVariables,
        error,
        allow
      } = this.routeRegistry.lookupRoute(path, method);
      if (error) {
        if (error === "METHOD_NOT_SUPPORTED") {
          ctx.set("Allow", allow.join(", "));
          if (method === HttpMethod.OPTIONS) {
            ctx.status = 200;
            ctx.state.result = "";
          } else {
            throw new MethodNotSupportedError();
          }
        } else if (error === "ROUTE_NOT_SUPPORTED") {
          throw new UnknownRouteError();
        }
      } else {
        registerPathVariables(pathVariables, requestContainer);
        // Invoke this route's handler, and store its response on the context
        // for later rendering.
        ctx.state.result = await requestContainer.build(resolver);
      }
      if (ctx.state.result === undefined) {
        ctx.state.result = "200 OK";
        ctx.status = 200;
      }
      await next();
    };
  }
}

/**
 * Register each path variable on the DI container.
 * @param pathVariables - A map of path variable keys to values
 * @param requestContainer - The request-scoped DI container to inject the values
 *    into.
 */
function registerPathVariables(
  pathVariables: { [key: string]: string },
  requestContainer: AwilixContainer
) {
  if (!pathVariables) {
    return;
  }
  for (const variable of Object.keys(pathVariables)) {
    requestContainer.register(variable, asValue(pathVariables[variable]));
  }
}
