import { bind } from "../AwilixHelpers";
import { Component } from "../reflection/Component";
import {
  IRouter,
  IRouterClass,
  isRouterClass
} from "../reflection/IRouterClass";
import { IScannableClass } from "../reflection/ScannableClass";
import {
  allowedRoles,
  httpMethods,
  routableMethods,
  targetRoute
} from "../reflection/Symbols";
import { RegisterRouteOptions, RouteRegistry } from "../web/RouteRegistry";
import {
  ApplicationContainer,
  ApplicationContext
} from "./context/ApplicationContext";
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
  private container: ApplicationContainer;
  /**
   * @private
   * @member componentList - The ComponentList. @see ComponentRegistrar
   */
  private componentList: IScannableClass[];
  private routeRegistry: RouteRegistry;
  /** @inject */
  constructor({ container, ComponentList, routeRegistry }: ApplicationContext) {
    this.container = container;
    this.componentList = ComponentList;
    this.routeRegistry = routeRegistry;
  }

  /**
   * Populate the application's route registry.
   */
  populateRouteRegistry() {
    /**
     * Get the dependency-injected instance of a @Component class.
     * @param routerClass - The class to look up.
     * @return The registered instance of the specified @Component class.
     */
    const getInstance = (routerClass: IRouterClass): IRouter => {
      const name = ComponentRegistrar.getRegistrationName(routerClass);
      const registration = this.container.cradle[
        name as keyof ApplicationContext
      ] as IRouter;
      return registration as IRouter;
    };

    /**
     * Register all decorated (ie: @Route) methods of a router.
     * @param router The router to register decorated routes for.
     */
    const registerDecoratedRoutes = (router: IRouter) => {
      if (router[routableMethods]) {
        router[routableMethods]!.forEach(routableMethod => {
          const routeOptions: RegisterRouteOptions = {
            route: routableMethod[targetRoute],
            methods: routableMethod[httpMethods],
            allowedRoles: routableMethod[allowedRoles],
            resolver: bind(routableMethod, router),
            router: this
          };
          this.routeRegistry.registerRoute(routeOptions);
        });
      }
    };

    /**
     * Invoke the router's underlying registerCustomRoutes implementation
     * (if any) on the global handlers map. This facilitates registerRoutes
     * as a lifecycle hook for our controller classes.
     * @param router The router to register custom routes for.
     */
    const registerCustomRoutes = (router: IRouter) => {
      if (router.registerRoutes) {
        this.container.build(bind(router.registerRoutes, router));
      }
    };

    this.componentList
      // filter the list of component classes down to controllers
      .filter(isRouterClass)
      // get the actual instance of the routers from their class
      .map(getInstance)
      .forEach((router: IRouter) => {
        // Register the decorated routes first
        registerDecoratedRoutes(router);
        // And the custom routes last, so they have the chance to override
        registerCustomRoutes(router);
      });
  }
}

declare global {
  interface ApplicationContextMembers {
    /**
     * Component responsible for populating the route registry with routable
     * methods parsed from the @Component list.
     */
    routeComponentProcessor: RouteComponentProcessor;
  }
}
