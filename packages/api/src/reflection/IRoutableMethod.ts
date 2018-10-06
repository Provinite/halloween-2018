import { IDecoratedMethod } from "./ScannableClass";
import { isRoutable, targetRoute } from "./Symbols";

export interface IRoutableMethod extends IDecoratedMethod {
  (..._: any[]): any;
  [isRoutable]: true;
  [targetRoute]: string;
}
