import { Context } from "koa";
import { Connection, Repository } from "typeorm";
import { RoleLiteral } from "../auth/RoleLiteral";
import { asClassMethod } from "../AwilixHelpers";
import { HttpMethod } from "../HttpMethod";
import { RouteRegistry } from "../web/RouteRegistry";
/**
 * Pluralize a given string.
 * @param str - The string to pluralize.
 */
const pluralize: (str: string) => string = (str: string) => {
  if (str.endsWith("s")) {
    return `${str}es`;
  }
  if (str.endsWith("y")) {
    return str.substr(0, str.length - 1) + "ies";
  }
  return `${str}s`;
};

/**
 * Creates a baseroute for the given class.
 * @param clazz - The entity class for the route.
 */
export function getRoute(clazz: new () => any) {
  return "/" + clazz.name[0].toLowerCase() + clazz.name.substr(1);
}
/**
 * Interface for objects mapping HTTP methods and routes to class methods.
 */
export interface IFallbackHandlerMap {
  [key: string]: {
    [method in HttpMethod]?: {
      fn: (...args: any[]) => any;
      roles: RoleLiteral[];
    }
  };
}
export abstract class RestRepositoryController<T> {
  protected modelClass: new () => T;
  protected repository: Repository<T>;
  protected baseRoute: string;
  protected listRoute: string;
  protected detailRoute: string;
  protected abstract defaultRoles: RoleLiteral[];
  constructor(orm: Connection, modelClass: new () => T) {
    this.modelClass = modelClass;
    this.repository = orm.getRepository(this.modelClass);
    this.baseRoute = getRoute(this.modelClass);
    this.listRoute = pluralize(this.baseRoute);
    this.detailRoute = `${this.listRoute}/{id}`;
  }

  /**
   * Registers default fallback handlers for this repository if they are
   * not already registered.
   * @param routeRegistry The route registry to write to.
   */
  registerRoutes(routeRegistry: RouteRegistry) {
    const fallbackHandlers: IFallbackHandlerMap = {
      [this.listRoute]: {
        [HttpMethod.GET]: {
          fn: this.getAll,
          roles: this.defaultRoles
        },
        [HttpMethod.POST]: {
          fn: this.createOne,
          roles: this.defaultRoles
        }
      },
      [this.detailRoute]: {
        [HttpMethod.GET]: { fn: this.getOne, roles: this.defaultRoles },
        [HttpMethod.DELETE]: { fn: this.deleteOne, roles: this.defaultRoles },
        [HttpMethod.PATCH]: { fn: this.updateOne, roles: this.defaultRoles }
      }
    };
    // allow for configuration of the map before applying it
    this.configureFallbackHandlers(fallbackHandlers);

    // apply the map without overwriting any existing routes
    for (const route of Object.keys(fallbackHandlers)) {
      const methodMap = fallbackHandlers[route];
      for (const method of Object.keys(methodMap) as HttpMethod[]) {
        const { error } = routeRegistry.lookupRoute(route, method);
        if (error) {
          // handler isn't covered, register the route
          const resolver = asClassMethod(this, methodMap[method].fn);
          routeRegistry.registerRoute(
            route,
            method,
            resolver,
            methodMap[method].roles
          );
        }
      }
    }
  }

  /**
   * Overridable method that allows for the fallback route handler map to
   * be modified prior to being applied. Default implementation is a no-op.
   *
   * This method will be invoked with the fallback handler map that is used to
   * generate default endpoints for the controller.
   *
   * This method may (should) modify the map in-place.
   *
   * @param fallbackHandlers - A route map. This map will be iterated over
   * and any (route, method) pairs defined in it that are not already registered
   * will be registered.
   * @see registerRoutes
   */
  configureFallbackHandlers(fallbackHandlers: IFallbackHandlerMap): void {
    // noop
  }

  /**
   * Get all T
   */
  async getAll(): Promise<T[]> {
    return (await this.repository.find()) || [];
  }

  /**
   * Handler for list-route POSTs
   * @Route POST /entityPlural
   * @param requestBody
   */
  async createOne(requestBody: any, ctx: Context): Promise<T> {
    const entity: T = this.repository.create();
    // TODO: massive security issues
    Object.keys(requestBody).forEach(key => {
      (entity as any)[key] = requestBody[key];
    });
    try {
      return await this.repository.save(entity as any);
    } catch (error) {
      ctx.status = 400;
      ctx.state.result = "";
      return null;
    }
  }

  /**
   * Handler for detail-route PATCHes
   * @Route PATCH /entityPlural/{id}
   * @param id - The ID of the entity to delete.
   */
  async updateOne(id: string, requestBody: any, ctx: Context) {
    try {
      const result = await this.repository.update(id, requestBody);
      return await this.getOne(id);
    } catch (error) {
      ctx.status = 400;
      ctx.state.result = "";
      return null;
    }
  }

  /**
   * Handler for detail-route DELETEs
   * @Route DELETE /entityPlural/{id}
   * @param id - The ID of the entity to delete.
   */
  async deleteOne(id: string): Promise<{ ok: boolean }> {
    await this.repository.delete(id);
    return { ok: true };
  }

  /**
   * Default handler for detail-route GETs
   * @Route POST /entityPlural/{id}
   * @param id - The ID of the entitity to fetch.
   */
  // @Route("/entities/{id}", GET)
  getOne(id: string): Promise<T> {
    return this.repository.findOne(id);
  }

  /**
   * Default handler for detail-route PATCHes
   * @Route PATCH /entityPlural/{id}
   * @param id - Pathvariable, the ID of the entity to fetch.
   * @param requestBody
   */
  async modifyOne(id: string, requestBody: any): Promise<T> {
    const entity: T = await this.repository.findOne(id);
    if (!entity) {
      // TODO: 404?
      return;
    }
    Object.keys(requestBody).forEach(key => {
      (entity as any)[key] = requestBody[key];
    });
    return this.repository.save(entity as any);
  }
}
