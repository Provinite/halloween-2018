import { RoleLiteral } from "../auth/RoleLiteral";
import { HttpMethod } from "../HttpMethod";
import { IDecoratedMethod } from "./ScannableClass";
import { allowedRoles, httpMethods, isRoutable, targetRoute } from "./Symbols";

export interface IRoutableMethod extends IDecoratedMethod {
  (..._: any[]): any;
  [isRoutable]: true;
  [targetRoute]: string;
  [httpMethods]: HttpMethod[];
  [allowedRoles]: RoleLiteral[];
}
