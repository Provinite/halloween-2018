import { Connection, Repository } from "typeorm";
import { HttpMethod } from "../HttpMethod";
import {
  classMethodHandler,
  IRouteMap
} from "../middlewares/RouterMiddlewareFactory";
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
   * @param handlers The route map to modify.
   */
  registerRoutes(handlers: IRouteMap): IRouteMap {
    const fallbackHandlers: {
      [key: string]: { [method in HttpMethod]?: (...args: any[]) => any };
    } = {
      [this.listRoute]: {
        [HttpMethod.GET]: this.getAll,
        [HttpMethod.POST]: this.createOne
      }
    };
    Object.keys(fallbackHandlers).forEach(route => {
      if (!handlers[route]) {
        handlers[route] = {};
      }
      Object.keys(fallbackHandlers[route]).forEach((method: HttpMethod) => {
        if (!handlers[route][method]) {
          handlers[route][method] = classMethodHandler(
            this,
            fallbackHandlers[route][method]
          );
        }
      });
    });
    return handlers;
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
