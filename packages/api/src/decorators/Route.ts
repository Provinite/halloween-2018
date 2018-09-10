import {
  decoratedType,
  DecoratedTypes,
  isRoutable,
  targetRoute
} from "./Symbols";

export function Route(route: string) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    descriptor.value[isRoutable] = true;
    descriptor.value[targetRoute] = route;
    descriptor.value[decoratedType] = DecoratedTypes.METHOD;
  };
}
