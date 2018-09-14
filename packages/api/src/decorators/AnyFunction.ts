export type AnyFunction = (..._: any[]) => any;
export function isFunction(fn: any): fn is AnyFunction {
  return fn && {}.toString.call(fn) === "[object Function]";
}
