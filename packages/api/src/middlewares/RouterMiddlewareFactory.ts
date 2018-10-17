import { asValue, AwilixContainer } from "awilix";
import { Context, Middleware } from "koa";
import { asClassMethod } from "../AwilixHelpers";
import { RequestParsingService } from "../config/RequestParsingService";
import { RouteTransformationService } from "../config/RouteTransformationService";
import { getMethod, HttpMethod } from "../HttpMethod";
import { IRouter } from "../reflection/IRouterClass";
import { RouteRegistry } from "../web/RouteRegistry";
import { IMiddlewareFactory } from "./IMiddlewareFactory";
import { INextCallback } from "./INextCallback";

export class RouterMiddlewareFactory implements IMiddlewareFactory {
  private requestParsingService: RequestParsingService;
  private routeRegistry: RouteRegistry;
  private container: AwilixContainer;
  constructor(
    container: AwilixContainer,
    requestParsingService: RequestParsingService,
    routeRegistry: RouteRegistry
  ) {
    this.container = container;
    this.requestParsingService = requestParsingService;
    this.routeRegistry = routeRegistry;
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

      // Create the request-scoped DI container
      const requestContainer: AwilixContainer = this.container.createScope();

      // Register the koa context to the request-scoped DI container
      requestContainer.register("ctx", asValue(ctx));

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
            // method not supported
            ctx.status = 405;
            ctx.state.result = `${method} not allowed.`;
          }
        } else if (error === "ROUTE_NOT_SUPPORTED") {
          ctx.state.result = "Not Found.";
          ctx.status = 404;
        }
      } else {
        registerPathVariables(pathVariables, requestContainer);
        this.requestParsingService.parse(ctx, requestContainer);
        try {
          ctx.state.result = await requestContainer.build(resolver);
        } catch (e) {
          ctx.state.result = "";
          /* tslint:disable */
          console.log("Exception during controller execution");
          console.log("Route: ", path);
          console.log(e);
          /* tslint:enable */
        }
      }
      if (ctx.state.result === undefined) {
        ctx.state.result = "200 OK";
        ctx.status = 200;
      }
      await next();
    };
  }
}

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
