import { IRoutableMethod } from "./IRoutableMethod";
import { IScannableClass } from "./ScannableClass";
import * as Symbols from "./Symbols";

export interface IRouter {
  [Symbols.routableMethods]?: IRoutableMethod[];
  registerRoutes?: (...args: any[]) => any;
}

export interface IRouterClass extends IScannableClass {
  [Symbols.isRouter]: true;
}

export function isRouter(obj: any): obj is IRouter {
  return obj[Symbols.routableMethods] && obj[Symbols.routableMethods].length;
}

export function isRouterClass(clazz: any): clazz is IRouterClass {
  return clazz[Symbols.isRouter] === true;
}
