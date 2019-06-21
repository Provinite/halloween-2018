import { RoleLiteral } from "../auth/RoleLiteral";
import { RequestContext } from "../config/context/RequestContext";
import { HttpMethod } from "../HttpMethod";
import { IRoutableMethod } from "./IRoutableMethod";
import { IRouterClass } from "./IRouterClass";
import {
  allowedRoles,
  decoratedType,
  DecoratedTypes,
  httpMethods,
  isRoutable,
  isRouter,
  routableMethods,
  targetRoute
} from "./Symbols";

export const defaultAllowedRoles: RoleLiteral[] = ["public"];

export function Route(
  route:
    | string
    | {
        route: string;
        method?: HttpMethod | HttpMethod[];
        roles?: RoleLiteral[];
      }
) {
  return function<ContextType extends RequestContext = RequestContext>(
    target: any,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<(context: ContextType) => any>
  ) {
    const value = descriptor.value as IRoutableMethod;
    let requestedRoute: string;
    let requestedMethods: HttpMethod[];
    let requestedRoles: RoleLiteral[];
    if (typeof route === "string") {
      // simple version, use the provided route and default methods
      requestedRoute = route;
      requestedMethods = [
        HttpMethod.GET,
        HttpMethod.POST,
        HttpMethod.PATCH,
        HttpMethod.PUT,
        HttpMethod.DELETE
      ];
      requestedRoles = defaultAllowedRoles;
    } else {
      // configuration object provided
      requestedRoute = route.route;
      if (route.method) {
        // support non-array for single methods since this is the most common
        // anticipated usage.
        // eg: @Route({method: "POST", route: "/foo"})
        // vs: @Route({method: ["POST"], route: "/foo"})
        if (!Array.isArray(route.method)) {
          route.method = [route.method];
        }
        requestedMethods = [...route.method];
        requestedRoles = route.roles || defaultAllowedRoles;
      } else {
        throw new Error(
          `Decorator:@Route: No methods defined for ${requestedRoute} (${
            target.constructor ? target.constructor.name : "{unknown}"
          }.${value.name})`
        );
      }
    }
    value[isRoutable] = true;
    value[targetRoute] = requestedRoute;
    value[httpMethods] = requestedMethods;
    value[decoratedType] = DecoratedTypes.METHOD;
    value[allowedRoles] = requestedRoles;
    (target.constructor as IRouterClass)[isRouter] = true;
    if (!target[routableMethods]) {
      target[routableMethods] = [];
    }
    target[routableMethods].push(descriptor.value);
  };
}
