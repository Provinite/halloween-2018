export const isScannable: unique symbol = Symbol("scannable");
export const isRoutable: unique symbol = Symbol("routable");
export const isRouter: unique symbol = Symbol("isRouter");
export const targetRoute: unique symbol = Symbol("targetRoute");
export const requiredRoles: unique symbol = Symbol("requiredRoles");
export const decoratedType: unique symbol = Symbol("decoratedType");
export const routableMethods: unique symbol = Symbol("routableMethods");
export const httpMethods: unique symbol = Symbol("httpMethods");
export enum DecoratedTypes {
  CLASS,
  METHOD
}
