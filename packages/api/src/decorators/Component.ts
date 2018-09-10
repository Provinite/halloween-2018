import { decoratedType, DecoratedTypes, isScannable } from "./Symbols";

export function Component(): ClassDecorator {
  return function(target: Function) {
    Object.defineProperty(target, isScannable, { value: true });
    Object.defineProperty(target, decoratedType, {
      value: DecoratedTypes.CLASS
    });
  };
}
