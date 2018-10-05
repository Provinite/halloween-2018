import { AwilixContainer } from "awilix";
import { Component } from "../reflection/Component";
import { IRoutableMethod } from "../reflection/IRoutableMethod";
import { IRouter, isRouterClass } from "../reflection/IRouterClass";
import { IScannableClass } from "../reflection/ScannableClass";
import { routableMethods, targetRoute } from "../reflection/Symbols";
import { ComponentRegistrar } from "./context/ComponentRegistrar";

/**
 * @class RouteComponentProcessor
 * Service used to interact with router components.
 */
@Component()
export class RouteComponentProcessor {
  private container: AwilixContainer;
  private componentList: IScannableClass[];
  constructor(container: AwilixContainer, ComponentList: IScannableClass[]) {
    // We need the actual controller list here, rather than the class list.
    // Maybe we could just run down the entire cradle and pick out routers.
    this.container = container;
    this.componentList = ComponentList;
  }

  /**
   * @method getRouteHandlerMap - Create an object mapping routes to routable
   * methods on scanned components.
   * @return { [route: string]: IRoutableMethod } A map of all registered routable
   *    methods.
   */
  getRouteHandlerMap(): { [route: string]: IRoutableMethod } {
    const routers: IRouter[] = this.componentList
      .map(componentClass => {
        if (isRouterClass(componentClass)) {
          const name = ComponentRegistrar.getRegistrationName(componentClass);
          const registration = this.container.cradle[name];
          return registration;
        }
      })
      .filter(_ => _);
    const handlers: { [route: string]: IRoutableMethod } = {};
    routers.forEach(router => {
      router[routableMethods].forEach(routableMethod => {
        handlers[routableMethod[targetRoute]] = routableMethod;
      });
    });
    return handlers;
  }
}
