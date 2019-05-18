export const isScannable: unique symbol = Symbol.for("scannable");
export const isRoutable: unique symbol = Symbol.for("routable");
export const isRouter: unique symbol = Symbol.for("isRouter");
export const targetRoute: unique symbol = Symbol.for("targetRoute");
export const allowedRoles: unique symbol = Symbol.for("allowedRoles");
export const decoratedType: unique symbol = Symbol.for("decoratedType");
export const routableMethods: unique symbol = Symbol.for("routableMethods");
export const httpMethods: unique symbol = Symbol.for("httpMethods");
export const lifeTime: unique symbol = Symbol.for("lifetime");
export enum DecoratedTypes {
  CLASS,
  METHOD
}
