import { Resolver } from "awilix";
import { RoleLiteral } from "../auth/RoleLiteral";
import { RouteTransformationService } from "../config/RouteTransformationService";
import { HttpMethod } from "../HttpMethod";
import { logger } from "../logging";
import { Component } from "../reflection/Component";
import { MethodNotSupportedError } from "./MethodNotSupportedError";
import { UnknownRouteError } from "./UnknownRouteError";
@Component()
/**
 * Class used for mapping request paths and http methods to handler resolvers.
 */
export class RouteRegistry {
  /** Data structure mapping route -> method -> resolver */
  private map: IRouteMap;
  private transformationService: RouteTransformationService;
  constructor(routeTransformationService: RouteTransformationService) {
    this.map = {};
    this.transformationService = routeTransformationService;
  }
  /**
   * Assign the supplied awilix resolver as the handler for the given
   * route and http verb(s).
   * @return this
   */
  registerRoute(
    route: string,
    methods: HttpMethod | HttpMethod[],
    resolver: Resolver<any> | ((...args: any[]) => any),
    router: any,
    allowedRoles: RoleLiteral[]
  ): this {
    logger.info(
      `RouteRegistry#registerRoute: Registering endpoint "${route}" [${methods}]`
    );
    if (!this.map[route]) {
      this.map[route] = {};
    }
    if (!Array.isArray(methods)) {
      methods = [methods];
    }
    methods.forEach(method => {
      this.map[route][method] = {
        router,
        resolver,
        allowedRoles
      };
    });
    return this;
  }

  /**
   * Get the resolver and path variables for the given request path.
   * @return The resolver and any path variables for the route and method.
   */
  lookupRoute(
    requestPath: string,
    method: HttpMethod
  ): {
    /**
     * The router instance for the handler, if any.
     */
    router: any;
    /**
     * An awilix resolver for the actual route handler. If lookup fails,
     * undefined.
     */
    resolver?: Resolver<any> | ((...args: any[]) => any);
    /**
     * A map of the extracted path variables for the request (name => value).
     * Undefined if lookup fails.
     */
    pathVariables?: { [key: string]: string };
    /**
     * A list of roles that may use this route.
     */
    allowedRoles?: RoleLiteral[];
  } {
    // Exact match (but don't get false exact matches on wildcard routes if the
    // request path literally contains something like {id})
    if (!requestPath.includes("{")) {
      if (this.map[requestPath]) {
        if (this.map[requestPath][method]) {
          return {
            router: this.map[requestPath][method].router,
            resolver: this.map[requestPath][method].resolver,
            allowedRoles: this.map[requestPath][method].allowedRoles
          };
        } else {
          throw new MethodNotSupportedError(Object.keys(
            this.map[requestPath]
          ) as HttpMethod[]);
        }
      }
    }

    // Check wildcard routes
    for (const route in this.map) {
      if (!route.includes("{")) {
        continue;
      }
      // TODO: This could be cached. Calculating on every request seems
      // wasteful.
      const parsedRoute = this.transformationService.parseRoute(route);
      const pathVariables = this.transformationService.getPathVariables(
        parsedRoute,
        requestPath
      );
      if (pathVariables) {
        // route matched, check method support
        if (this.map[route][method]) {
          return {
            router: this.map[route][method].router,
            resolver: this.map[route][method].resolver,
            allowedRoles: this.map[route][method].allowedRoles,
            pathVariables
          };
        } else {
          throw new MethodNotSupportedError(Object.keys(
            this.map[route]
          ) as HttpMethod[]);
        }
      }
    }
    // No matches found
    throw new UnknownRouteError();
  }
}

/* Private Interfaces */
/**
 * Object mapping http methods to resolvers for a given route.
 */
type IRouteHandler = {
  [method in HttpMethod]?: {
    router: any;
    resolver: Resolver<any> | ((...args: any[]) => any);
    allowedRoles: RoleLiteral[];
  }
};
/**
 * Object mapping routes to handler objects.
 */
interface IRouteMap {
  [route: string]: IRouteHandler | undefined;
}

declare global {
  interface ApplicationContext {
    /** The registry of all routes that this application covers */
    routeRegistry: RouteRegistry;
  }
}
