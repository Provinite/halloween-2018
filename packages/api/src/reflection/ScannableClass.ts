import { LifetimeType } from "awilix";
import {
  decoratedType,
  DecoratedTypes,
  isScannable,
  lifeTime
} from "./Symbols";

type IClass = new (..._: any[]) => any;

export function classIsScannable(fn: IClass): fn is IScannableClass {
  return fn && fn.hasOwnProperty(isScannable);
}

export interface IScannableClass {
  [isScannable]: boolean;
  [decoratedType]: DecoratedTypes.CLASS;
  [lifeTime]: LifetimeType;
  new (..._: any[]): this;
}

export interface IDecoratedMethod {
  [decoratedType]: DecoratedTypes.METHOD;
}
