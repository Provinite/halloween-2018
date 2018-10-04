import {
  decoratedType,
  DecoratedTypes,
  isRoutable,
  routableMethods,
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
    if (!target[routableMethods]) {
      target[routableMethods] = [];
    }
    target[routableMethods].push(descriptor.value);
  };
}
