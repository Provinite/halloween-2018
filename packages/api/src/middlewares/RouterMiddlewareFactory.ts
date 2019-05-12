import { asValue } from "awilix";
import { Context, Middleware } from "koa";
import { bind } from "../AwilixHelpers";
import { ApplicationContext } from "../config/context/ApplicationContext";
import {
  RequestContainer,
  RequestContext
} from "../config/context/RequestContext";
import { getMethod, HttpMethod } from "../HttpMethod";
import { RouteRegistry } from "../web/RouteRegistry";
import { UnknownMethodError } from "../web/UnknownMethodError";
import { IMiddlewareFactory } from "./IMiddlewareFactory";
import { INextCallback } from "./INextCallback";

/**
 * Middleware factory that provides a routing middleware. The created
 * middleware will examine incoming requests, map them to the proper route
 * handler, and use the request-scoped DI container to invoke that handler.
 * Depends on ctx.state.requestContainer being set.
 */
export class RouterMiddlewareFactory implements IMiddlewareFactory {
  private routeRegistry: RouteRegistry;
  /**
   * @param routeRegistry - The route registry to use when mapping requests.
   * @inject
   */
  constructor({ routeRegistry }: ApplicationContext) {
    this.routeRegistry = routeRegistry;
  }
  /**
   * Create the router middleware.
   */
  create(): Middleware {
    return async (ctx: Context, next: INextCallback) => {
      const path: string = ctx.path;
      const method: HttpMethod = getMethod(ctx.method);
      if (!method) {
        throw new UnknownMethodError();
      }

      // Fetch the DI container for this request
      if (!ctx.state.requestContainer) {
        throw new Error("No request container available.");
      }
      const requestContainer: RequestContainer = ctx.state.requestContainer;

      const {
        router,
        resolver,
        pathVariables
      } = this.routeRegistry.lookupRoute(path, method);
      registerPathVariables(pathVariables, requestContainer);
      // TODO: this could be a typeguard
      if (router && typeof router.configureRequestContainer === "function") {
        await requestContainer.build(
          bind(router.configureRequestContainer, router)
        );
      }
      // Invoke this route's handler, and store its response on the context
      // for later rendering.
      ctx.state.result = await requestContainer.build(resolver);
      // TODO: get rid of this, or move it somewhere else.
      if (ctx.state.result === undefined) {
        ctx.state.result = "200 OK";
        ctx.status = 200;
      }
      await next();
    };
  }
}

/**
 * Register each path variable on the DI container. Additionally register the
 * pathVariables map as "pathVariables"
 * @param pathVariables - A map of path variable keys to values
 * @param requestContainer - The request-scoped DI container to inject the values
 *    into.
 * @configures pathVariables - The pathVariables map.
 * @configures * - One entry for each path variable received. (DEPRECATED)
 */
function registerPathVariables(
  pathVariables: { [key: string]: string },
  requestContainer: RequestContainer
) {
  requestContainer.register("pathVariables", asValue(pathVariables || {}));
  if (!pathVariables) {
    return;
  }
  for (const variable of Object.keys(pathVariables)) {
    requestContainer.register(
      variable as keyof RequestContext,
      asValue(pathVariables[variable])
    );
  }
}

declare global {
  interface RequestContextMembers {
    pathVariables: { [pathVariable: string]: string | undefined };
  }
}
