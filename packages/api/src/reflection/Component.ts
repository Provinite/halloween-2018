import { decoratedType, DecoratedTypes, isScannable } from "./Symbols";
/**
 * Decorator used to register components in the DI container.
 */
export function Component(): ClassDecorator {
  return function(target: Function) {
    Object.defineProperty(target, isScannable, { value: true });
    Object.defineProperty(target, decoratedType, {
      value: DecoratedTypes.CLASS
    });
  };
}
