import { AwilixContainer } from "awilix";
import { HttpMethod } from "../HttpMethod";
import {
  IRequestHandler,
  IRouteHandler,
  IRouteMap
} from "../middlewares/RouterMiddlewareFactory";
import { Component } from "../reflection/Component";
import {
  IRouter,
  IRouterClass,
  isRouterClass
} from "../reflection/IRouterClass";
import { IScannableClass } from "../reflection/ScannableClass";
import {
  httpMethods,
  routableMethods,
  targetRoute
} from "../reflection/Symbols";
import { ComponentRegistrar } from "./context/ComponentRegistrar";

/**
 * @class RouteComponentProcessor
 * Service used to interact with router components.
 * This service is responsible for scanning the application context for routable
 * methods and creating a handler map of them.
 */
@Component()
export class RouteComponentProcessor {
  /**
   * @private
   * @member container - The application's DI container. Used to create request
   *    scoped child containers, and provide DI for route handler methods.
   */
  private container: AwilixContainer;
  /**
   * @private
   * @member componentList - The ComponentList. @see ComponentRegistrar
   */
  private componentList: IScannableClass[];
  constructor(container: AwilixContainer, ComponentList: IScannableClass[]) {
    this.container = container;
    this.componentList = ComponentList;
  }

  /**
   * @method getRouteHandlerMap - Create an object mapping routes to routable
   * methods on scanned components.
   * @return A RouteMap for the entire application context.
   */
  getRouteHandlerMap(): IRouteMap {
    // The functions below will write to this handlers map as
    // the routers are processed
    const handlers: IRouteMap = {};
    /**
     * Get the dependency-injected instance of a @Component class.
     * @param routerClass - The class to look up.
     * @return The registered instance of the specified @Component class.
     */
    const getInstance = (routerClass: IRouterClass): IRouter => {
      const name = ComponentRegistrar.getRegistrationName(routerClass);
      const registration = this.container.cradle[name];
      return registration as IRouter;
    };

    const registerDecoratedRoutes = (router: IRouter): IRouter => {
      // First, run down any registered routable methods
      if (router[routableMethods]) {
        router[routableMethods].forEach(routableMethod => {
          const route: string = routableMethod[targetRoute];
          // the HTTP verbs we are registering for
          const methods = routableMethod[httpMethods];
          // Register the method as a route handler, provide context so that
          // `this` can be set intuitively for class members.
          const handler: IRequestHandler = {
            methodName: routableMethod.name,
            invokeOn: router,
            fn: routableMethod
          };
          // Commit the registration to the result map
          methods.forEach(httpMethod => {
            if (!handlers[route]) {
              handlers[route] = {};
            }
            handlers[route][httpMethod] = handler;
          });
        });
      }
      return router;
    };

    /**
     * Invoke the router's underlying registerCustomRoutes implementation
     * (if any) on the global handlers map. This facilitates registerRoutes
     * as a lifecycle hook for our controller classes.
     * @param router The router to register custom routes for.
     */
    const registerCustomRoutes = (router: IRouter): IRouter => {
      if (router.registerRoutes) {
        router.registerRoutes(handlers);
      }
      return router;
    };

    this.componentList
      .filter(isRouterClass) // filter the list of component classes down to controllers
      .map(getInstance) // get the actual instance of the routers from their class
      .forEach((router: IRouter) => {
        // Register the decorated routes first
        registerDecoratedRoutes(router);
        // And the custom routes last, so they have the chance to override
        registerCustomRoutes(router);
      });
    return handlers;
  }
}
