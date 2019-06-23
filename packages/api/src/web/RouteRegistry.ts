import { Resolver } from "awilix";
import { RoleLiteral } from "../auth/RoleLiteral";
import { ApplicationContext } from "../config/context/ApplicationContext";
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
  /** @inject */
  constructor({ routeTransformationService }: ApplicationContext) {
    this.map = {};
    this.transformationService = routeTransformationService;
  }

  /**
   * Assign the supplied awilix resolver as the handler for the given
   * route and http verb(s).
   * @return this
   */
  registerRoute({
    route,
    methods,
    resolver,
    router,
    allowedRoles
  }: RegisterRouteOptions): this {
    logger.info(
      `RouteRegistry#registerRoute: Registering endpoint "${route}" [${methods}]`
    );
    if (!this.map[route]) {
      this.map[route] = {};
    }
    const endpoint = this.map[route]!;
    if (!Array.isArray(methods)) {
      methods = [methods];
    }
    methods.forEach(method => {
      endpoint[method] = {
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
  lookupRoute(requestPath: string, method: HttpMethod): RouteLookupResult {
    // Exact match (but don't get false exact matches on wildcard routes if the
    // request path literally contains something like {id})
    if (!requestPath.includes("{")) {
      if (this.map[requestPath]) {
        const endpoint = this.map[requestPath]!;
        if (endpoint[method]) {
          const route = this.map[requestPath]![method]!;
          const result: RouteLookupResult = {
            router: route.router,
            resolver: route.resolver,
            allowedRoles: route.allowedRoles
          };
          return result;
        } else {
          throw new MethodNotSupportedError(Object.keys(
            endpoint
          ) as HttpMethod[]);
        }
      }
    }

    // Check wildcard routes
    for (const path in this.map) {
      if (!path.includes("{")) {
        continue;
      }
      // TODO: This could be cached. Calculating on every request seems
      // wasteful.
      const parsedRoute = this.transformationService.parseRoute(path);
      const pathVariables = this.transformationService.getPathVariables(
        parsedRoute,
        requestPath
      );
      if (pathVariables) {
        const endpoint = this.map[path]!;
        // route matched, check method support
        if (endpoint[method]) {
          const route = endpoint[method]!;
          const result: RouteLookupResult = {
            router: route.router,
            resolver: route.resolver,
            allowedRoles: route.allowedRoles,
            pathVariables
          };
          return result;
        } else {
          throw new MethodNotSupportedError(Object.keys(
            endpoint
          ) as HttpMethod[]);
        }
      }
    }
    // No matches found
    throw new UnknownRouteError();
  }
}

/* Public Interfaces */
/**
 * Type for the `options` arg to RouteRegistry#registerRoute
 */
export interface RegisterRouteOptions {
  /**
   * The route to match on. Supports wildcards using the {pathVariableName}
   * format.
   * @example
   * "/users" // registers a route at "/users"
   * @example
   * "/users/{userId}" // registers a wildcard route with the `userId` pathvariable.
   */
  route: string;
  methods: HttpMethod | HttpMethod[];
  resolver: Resolver<any> | ((...args: any[]) => any);
  router: any;
  allowedRoles: RoleLiteral[];
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

interface RouteLookupResult {
  /**
   * The router instance for the handler, if any.
   */
  router: any;
  /**
   * An awilix resolver for the actual route handler. If lookup fails,
   * undefined.
   */
  resolver: Resolver<any> | ((...args: any[]) => any);
  /**
   * A list of roles that may use this route.
   */
  allowedRoles: RoleLiteral[];
  /**
   * A map of the extracted path variables for the request (name => value).
   * Undefined if lookup fails.
   */
  pathVariables?: { [key: string]: string };
}

declare global {
  interface ApplicationContextMembers {
    /** The registry of all routes that this application covers */
    routeRegistry: RouteRegistry;
  }
}
