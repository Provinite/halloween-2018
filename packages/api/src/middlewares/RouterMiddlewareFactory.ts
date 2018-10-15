import { asValue, AwilixContainer } from "awilix";
import { Context, Middleware } from "koa";
import { asClassMethod } from "../AwilixHelpers";
import { RequestParsingService } from "../config/RequestParsingService";
import { RouteTransformationService } from "../config/RouteTransformationService";
import { getMethod, HttpMethod } from "../HttpMethod";
import { IRouter } from "../reflection/IRouterClass";
import { IMiddlewareFactory } from "./IMiddlewareFactory";
import { INextCallback } from "./INextCallback";
/**
 * Object mapping http methods to request handlers for a given route.
 */
export type IRouteHandler = { [method in HttpMethod]?: IRequestHandler };

/**
 * Object containing all necessary information to invoke a routable method as
 * a request handler.
 */
export interface IRequestHandler {
  methodName?: string;
  invokeOn?: IRouter;
  fn?: (...args: any[]) => any;
}
/**
 * Object mapping http methods and routes to an appropriate handler.
 */
export interface IRouteMap {
  [route: string]: IRouteHandler | undefined;
}

export function classMethodHandler(
  instance: any,
  method: (...args: any[]) => any
): IRequestHandler {
  return {
    methodName: method.name,
    invokeOn: instance,
    fn: method
  };
}

export class RouterMiddlewareFactory implements IMiddlewareFactory {
  private requestParsingService: RequestParsingService;
  private routeTransformationService: RouteTransformationService;
  private handlers: IRouteMap;
  private container: AwilixContainer;
  constructor(
    handlers: IRouteMap,
    container: AwilixContainer,
    requestParsingService: RequestParsingService,
    routeTransformationService: RouteTransformationService
  ) {
    this.handlers = handlers;
    this.container = container;
    this.routeTransformationService = routeTransformationService;
    this.requestParsingService = requestParsingService;
  }
  create(): Middleware {
    return async (ctx: Context, next: INextCallback) => {
      const path: string = ctx.path;
      const method: HttpMethod = getMethod(ctx.method);
      if (!method) {
        // https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html
        // 10.5.2 501 Not Implemented
        // "The server does not support the functionality required to fulfill
        // the request. This is the appropriate response when the server does
        // not recognize the request method and is not capable of supporting it
        // for any resource."
        ctx.state.result = `${ctx.method}`;
        ctx.status = 501;
      }

      /**
       * Lookup the appropriate handler for this request, and parse
       * any path variables.
       * @return undefined if the route is not registered, otherwise an object
       *    with a route handler (map of methods to request handlers), and
       *    a (optionally) a map of the path variables.
       */
      const getHandler: () => {
        handler: IRouteHandler;
        pathVariables?: { [key: string]: any };
      } = () => {
        // Exact match (but don't get weird if people literally enter {id})
        if (!path.includes("{")) {
          if (this.handlers[path]) {
            return {
              handler: this.handlers[path]
            };
          }
        }

        for (const route in this.handlers) {
          // Find all potential wildcard routes
          if (route.includes("{")) {
            // TODO: This could be cached. Calculating on every request seems
            // wasteful.
            const parsedRoute = this.routeTransformationService.parseRoute(
              route
            );
            const pathVariables = this.routeTransformationService.getPathVariables(
              parsedRoute,
              path
            );
            if (pathVariables) {
              // variables successfully extracted, we have a match.
              // check if we can support this verb
              return {
                handler: this.handlers[route],
                pathVariables
              };
            }
          }
        }
      };

      // Create the request-scoped DI container
      const requestContainer: AwilixContainer = this.container.createScope();

      // Register the koa context to the request-scoped DI container
      requestContainer.register("ctx", asValue(ctx));

      const result = getHandler();
      if (result) {
        const { handler, pathVariables } = result;
        if (handler[method]) {
          const { invokeOn: instance, fn } = handler[method];
          if (pathVariables) {
            // register path variables for DI
            Object.keys(pathVariables).forEach(variable => {
              requestContainer.register(
                variable,
                asValue(pathVariables[variable])
              );
            });
          }
          this.requestParsingService.parse(ctx, requestContainer);
          // invoke the routable method
          try {
            ctx.state.result = await requestContainer.build(
              asClassMethod(instance, fn)
            );
          } catch (e) {
            ctx.state.result = "";
            /* tslint:disable */
            console.log("Exception during controller execution");
            console.log("Route: ", path);
            console.log(e);
            /* tslint:enable */
          }
        } else {
          ctx.set("Allow", Object.keys(handler).join(", "));
          if (method === HttpMethod.OPTIONS) {
            ctx.state.result = "";
          } else {
            // method not supported
            ctx.status = 405;
            ctx.state.result = `${method} not allowed.`;
          }
        }
      }
      // Catchall for now
      if (ctx.state.result === undefined) {
        ctx.state.result = "Not Found.";
        ctx.status = 404;
      }
      await next();
    };
  }
}
