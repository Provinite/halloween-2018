export const isScannable: unique symbol = Symbol("scannable");
export const isRoutable: unique symbol = Symbol("routable");
export const isRouter: unique symbol = Symbol("isRouter");
export const targetRoute: unique symbol = Symbol("targetRoute");
export const decoratedType: unique symbol = Symbol("decoratedType");
export const routableMethods: unique symbol = Symbol("routableMethods");
export enum DecoratedTypes {
  CLASS,
  METHOD
}
