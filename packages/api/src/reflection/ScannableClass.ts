import { decoratedType, DecoratedTypes, isScannable } from "./Symbols";

type IClass = new (..._: any[]) => any;

export function classIsScannable(fn: IClass): fn is IScannableClass {
  return fn && fn.hasOwnProperty(isScannable);
}

export interface IScannableClass {
  [isScannable]: boolean;
  [decoratedType]: DecoratedTypes.CLASS;
  new (..._: any[]): this;
}

export interface IDecoratedMethod {
  [decoratedType]: DecoratedTypes.METHOD;
}
