import { Resolver } from "awilix";
import { HttpMethod } from "../HttpMethod";
/**
 * Class used for mapping request paths and http methods to handler resolvers.
 */
export class RouteRegistry {
  /** Data structure mapping route -> method -> resolver */
  private map: IRouteMap;
  constructor() {
    this.map = {};
  }
  /**
   * Assign the supplied awilix resolver as the handler for the given
   * route and http verb(s).
   * @return this
   */
  registerRoute(
    route: string,
    methods: HttpMethod | HttpMethod[],
    resolver: Resolver<any>
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
    resolver: Resolver<any>;
    pathVariables?: { [key: string]: string };
  } {
    if (!this.map[requestPath] || !this.map[requestPath][method]) {
      return;
    }
    return {
      resolver: this.map[requestPath][method]
    };
  }
}

/* Private Interfaces */
/**
 * Object mapping http methods to resolvers for a given route.
 */
type IRouteHandler = { [method in HttpMethod]?: Resolver<any> };

/**
 * Object mapping routes to handler objects.
 */
interface IRouteMap {
  [route: string]: IRouteHandler | undefined;
}
