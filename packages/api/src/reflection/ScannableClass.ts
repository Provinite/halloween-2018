import { LifetimeType } from "awilix";
import {
  decoratedType,
  DecoratedTypes,
  isScannable,
  lifeTime
} from "./Symbols";

type IClass = new (..._: any[]) => any;

export function classIsScannable(fn: IClass): fn is IScannableClass {
  if (!fn) {
    return false;
  }
  const scannable = Object.getOwnPropertyDescriptor(fn, isScannable) as any;
  return scannable;
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
