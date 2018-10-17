import { Resolver } from "awilix";
import { RouteTransformationService } from "../config/RouteTransformationService";
import { HttpMethod } from "../HttpMethod";
import { Component } from "../reflection/Component";
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
    resolver: Resolver<any> | ((...args: any[]) => any)
  ): this {
    if (!this.map[route]) {
      this.map[route] = {};
    }
    if (!Array.isArray(methods)) {
      methods = [methods];
    }
    methods.forEach(method => {
      this.map[route][method] = resolver;
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
    resolver?: Resolver<any> | ((...args: any[]) => any);
    pathVariables?: { [key: string]: string };
    error?: "METHOD_NOT_SUPPORTED" | "ROUTE_NOT_SUPPORTED";
    allow?: HttpMethod[];
  } {
    // Exact match (but don't get false exact matches on wildcard routes if the
    // request path literally contains something like {id})
    if (!requestPath.includes("{")) {
      if (this.map[requestPath]) {
        if (this.map[requestPath][method]) {
          return {
            resolver: this.map[requestPath][method]
          };
        } else {
          return {
            error: "METHOD_NOT_SUPPORTED",
            allow: Object.keys(this.map[requestPath]) as HttpMethod[]
          };
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
            resolver: this.map[route][method],
            pathVariables
          };
        } else {
          return {
            error: "METHOD_NOT_SUPPORTED",
            allow: Object.keys(this.map[route]) as HttpMethod[]
          };
        }
      }
    }
    // No matches found
    return {
      error: "ROUTE_NOT_SUPPORTED"
    };
  }
}

/* Private Interfaces */
/**
 * Object mapping http methods to resolvers for a given route.
 */
type IRouteHandler = {
  [method in HttpMethod]?: Resolver<any> | ((...args: any[]) => any)
};
/**
 * Object mapping routes to handler objects.
 */
interface IRouteMap {
  [route: string]: IRouteHandler | undefined;
}
