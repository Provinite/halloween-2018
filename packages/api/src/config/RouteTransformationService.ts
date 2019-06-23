import { Component } from "../reflection/Component";

interface IParsedRoute {
  pattern: RegExp;
  routeParams: string[];
}

/**
 * Class which defines behavior for matching request url's to registered routes.
 */
@Component()
export class RouteTransformationService {
  /**
   * Extract metadata from a path registration.
   * @param path - The path to parse.
   * @return An object with a pattern and route params list.
   */
  parseRoute(path: string): IParsedRoute {
    const pattern = this.getRouteRegex(path);
    const routeParams = this.getRouteParams(path);
    return {
      pattern,
      routeParams
    };
  }

  /**
   * Get a map of populated path variables for the specified route & request path.
   * @param route - The (parsed) route to populate.
   * @param path - The actual request path to pull params from.
   * @return An object mapping path param names to string values. Returns undefined if
   *    the route did not match this path.
   */
  getPathVariables(
    route: IParsedRoute,
    requestPath: string
  ): { [param: string]: string } | undefined {
    const { routeParams, pattern } = route;
    const result: { [param: string]: string } = {};

    const regexResult = pattern.exec(requestPath);
    if (!regexResult) {
      return undefined;
    }

    let index = 0;
    for (const routeParam of routeParams) {
      result[routeParam] = regexResult[index + 1];
      index++;
    }
    return result;
  }

  /**
   * Get the ordered list of route params from a path.
   * eg: /foo/{id} => ["id"]
   * @param path - The path to parse for route params.
   */
  protected getRouteParams(path: string): string[] {
    const parts = path.split(/\{|\}/g);
    const routeParams: string[] = [];

    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        continue;
      }
      routeParams.push(parts[i]);
    }

    return routeParams;
  }

  /**
   * Get the regex pattern to be used for matching/extracting route param values.
   * @param path - The path to create a regex for.
   * @return A RegExp object with a matching group for each param.
   */
  protected getRouteRegex(path: string): RegExp {
    // split the string on { } path param indicators
    const parts = path.split(/\{|\}/g);
    let pattern = "";
    for (let i = 0; i < parts.length; i++) {
      const isPathParam = i % 2 === 1;
      if (!isPathParam) {
        pattern += parts[i].replace(/\//g, "\\/");
      } else {
        pattern += "([^/]*?)";
      }
    }
    return new RegExp(`^${pattern}$`);
  }
}

declare global {
  interface ApplicationContextMembers {
    routeTransformationService: RouteTransformationService;
  }
}
