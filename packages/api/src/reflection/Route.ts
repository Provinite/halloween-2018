import { IRoutableMethod } from "./IRoutableMethod";
import { IRouterClass } from "./IRouterClass";
import {
  decoratedType,
  DecoratedTypes,
  isRoutable,
  isRouter,
  routableMethods,
  targetRoute
} from "./Symbols";

export function Route(route: string) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const value = descriptor.value as IRoutableMethod;
    value[isRoutable] = true;
    value[targetRoute] = route;
    value[decoratedType] = DecoratedTypes.METHOD;
    (target.constructor as IRouterClass)[isRouter] = true;

    if (!target[routableMethods]) {
      target[routableMethods] = [];
    }
    target[routableMethods].push(descriptor.value);
  };
}
