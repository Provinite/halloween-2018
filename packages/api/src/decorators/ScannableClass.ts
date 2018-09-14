import { AnyFunction } from "./AnyFunction";
import { decoratedType, DecoratedTypes, isScannable } from "./Symbols";

export function classIsScannable(fn: () => void): fn is IScannableClass {
  return fn && fn.hasOwnProperty(isScannable);
}
export type IScannableClass = AnyFunction & {
  [isScannable]: boolean;
  [decoratedType]: DecoratedTypes;
};
