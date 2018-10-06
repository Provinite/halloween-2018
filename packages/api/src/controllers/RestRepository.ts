import { Connection, Repository } from "typeorm";
import { IRouteMap } from "../middlewares/RouterMiddlewareFactory";
import { IRoutableMethod } from "../reflection/IRoutableMethod";
import { isRouterClass } from "../reflection/IRouterClass";
import { Route } from "../reflection/Route";
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
  private orm: Connection;
  constructor(orm: Connection, modelClass: new () => T) {
    this.orm = orm;
    this.modelClass = modelClass;
    this.repository = orm.getRepository(this.modelClass);
    this.baseRoute = getRoute(this.modelClass);
    this.listRoute = pluralize(this.baseRoute);
  }
  registerRoutes(handlers: IRouteMap): IRouteMap {
    const fallbackHandlers = {
      [this.listRoute]: this.getAll.bind(this)
    };
    for (const route in fallbackHandlers) {
      if (!handlers[route]) {
        handlers[route] = fallbackHandlers[route];
      }
    }
    return handlers;
  }
  getAll(): Promise<T[]> {
    return this.repository.find();
  }
}
