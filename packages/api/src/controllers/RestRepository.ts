import { Connection, Repository } from "typeorm";
import { HttpMethod } from "../HttpMethod";
import {
  classMethodHandler,
  IRouteMap
} from "../middlewares/RouterMiddlewareFactory";
const pluralize: (str: string) => string = (str: string) =>
  str.endsWith("s") ? str + "es" : str + "s";

export function getRoute(clazz: new () => any) {
  return "/" + clazz.name.toLowerCase();
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
  registerRoutes(handlers: IRouteMap): IRouteMap {
    const fallbackHandlers = {
      [this.listRoute]: {
        fn: this.getAll,
        method: HttpMethod.GET
      }
    };
    for (const route in fallbackHandlers) {
      if (!handlers[route]) {
        const method = fallbackHandlers[route].method;
        // TODO: This isn't super pleasant. There should be a real API for this.
        // one with docs, and less bullshit.
        if (!handlers[route]) {
          handlers[route] = {};
        }
        handlers[route][method] = classMethodHandler(
          this,
          fallbackHandlers[route].fn
        );
      }
    }
    return handlers;
  }
  getAll(): Promise<T[]> {
    return this.repository.find();
  }
}
