import { Connection, Repository } from "typeorm";
import { asClassMethod } from "../AwilixHelpers";
import { HttpMethod } from "../HttpMethod";
import { RouteRegistry } from "../web/RouteRegistry";
const pluralize: (str: string) => string = (str: string) => {
  if (str.endsWith("s")) {
    return `${str}es`;
  }
  if (str.endsWith("y")) {
    return str.substr(0, str.length - 1) + "ies";
  }
  return `${str}s`;
};
export function getRoute(clazz: new () => any) {
  return "/" + clazz.name[0].toLowerCase() + clazz.name.substr(1);
}
export abstract class RestRepository<T> {
  protected modelClass: new () => T;
  protected repository: Repository<T>;
  protected baseRoute: string;
  protected listRoute: string;
  constructor(orm: Connection, modelClass: new () => T) {
    this.modelClass = modelClass;
    this.repository = orm.getRepository(this.modelClass);
    this.baseRoute = getRoute(this.modelClass);
    this.listRoute = pluralize(this.baseRoute);
  }
  /**
   * Registers default fallback handlers for this repository if they are
   * not already registered.
   * @param routeRegistry The route registry to write to.
   */
  registerRoutes(routeRegistry: RouteRegistry) {
    interface IFallbackHandlerMap {
      [key: string]: { [method in HttpMethod]?: (...args: any[]) => any };
    }
    const fallbackHandlers: IFallbackHandlerMap = {
      [this.listRoute]: {
        [HttpMethod.GET]: this.getAll,
        [HttpMethod.POST]: this.createOne
      }
    };
    for (const route of Object.keys(fallbackHandlers)) {
      const methodMap = fallbackHandlers[route];
      for (const method of Object.keys(methodMap) as HttpMethod[]) {
        const { error } = routeRegistry.lookupRoute(route, method);
        if (error) {
          // handler isn't covered, register the route
          const resolver = asClassMethod(this, methodMap[method]);
          routeRegistry.registerRoute(route, method, resolver);
        }
      }
    }
  }

  /**
   * Get all T
   */
  getAll(): Promise<T[]> {
    return this.repository.find();
  }

  createOne(requestBody: any): Promise<T> {
    const entity: T = this.repository.create();
    Object.keys(requestBody).forEach(key => {
      (entity as any)[key] = requestBody[key];
    });
    return this.repository.save(entity as any);
  }
}
