import { decoratedType, DecoratedTypes, isScannable } from "./Symbols";

export function classIsScannable(
  fn: new (..._: any[]) => {}
): fn is IScannableClass {
  return fn && fn.hasOwnProperty(isScannable);
}
export type IScannableClass = (new (..._: any[]) => {}) & {
  [isScannable]: boolean;
  [decoratedType]: DecoratedTypes;
};
