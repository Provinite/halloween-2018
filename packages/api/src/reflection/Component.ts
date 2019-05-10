import { LifetimeType } from "awilix";
import {
  decoratedType,
  DecoratedTypes,
  isScannable,
  lifeTime as lifeTimeSymbol
} from "./Symbols";
/**
 * Decorator used to register components in the DI container.
 */
export function Component(
  lifeTime: LifetimeType = "SINGLETON"
): ClassDecorator {
  return function(target: Function) {
    Object.defineProperty(target, isScannable, { value: true });
    Object.defineProperty(target, decoratedType, {
      value: DecoratedTypes.CLASS
    });
    Object.defineProperty(target, lifeTimeSymbol, { value: lifeTime });
  };
}
