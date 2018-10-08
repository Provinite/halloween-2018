import { asValue, AwilixContainer } from "awilix";
import { Context, Middleware } from "koa";
import { asClassMethod } from "../AwilixHelpers";
import { RouteTransformationService } from "../config/RouteTransformationService";
import { IRouter } from "../reflection/IRouterClass";
import { IMiddlewareFactory } from "./IMiddlewareFactory";
import { INextCallback } from "./INextCallback";
export interface IRouteHandler {
  methodName?: string;
  invokeOn?: IRouter;
  fn?: (...args: any[]) => any;
}
export interface IRouteMap {
  [route: string]: IRouteHandler;
}

export function classMethodHandler(
  instance: any,
  method: (...args: any[]) => any
): IRouteHandler {
  return {
    methodName: method.name,
    invokeOn: instance,
    fn: method
  };
}

export class RouterMiddlewareFactory implements IMiddlewareFactory {
  private routeTransformationService: RouteTransformationService;
  private handlers: IRouteMap;
  private container: AwilixContainer;
  constructor(
    handlers: IRouteMap,
    container: AwilixContainer,
    routeTransformationService: RouteTransformationService
  ) {
    this.handlers = handlers;
    this.container = container;
    this.routeTransformationService = routeTransformationService;
  }
  create(): Middleware {
    return async (ctx: Context, next: INextCallback) => {
      const path: string = ctx.path;

      /**
       * Lookup the appropriate handler for this request, and parse
       * any path variables.
       */
      const getHandler = () => {
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
            const parsedRoute = this.routeTransformationService.parseRoute(
              route
            );
            const pathVariables = this.routeTransformationService.getPathVariables(
              parsedRoute,
              path
            );
            if (pathVariables) {
              // variables successfully extracted, we have a match.
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

      const handler = getHandler();

      if (handler) {
        const { invokeOn: instance, fn: method } = handler.handler;
        if (handler.pathVariables) {
          // register path variables for DI
          Object.keys(handler.pathVariables).forEach(variable => {
            requestContainer.register(
              variable,
              asValue(handler.pathVariables[variable])
            );
          });
        }

        ctx.state.result = await requestContainer.build(
          asClassMethod(instance, method)
        );
      }
      // Catchall for now
      if (ctx.state.result === undefined) {
        ctx.state.result = "Not Found.";
      }
      await next();
    };
  }
}
