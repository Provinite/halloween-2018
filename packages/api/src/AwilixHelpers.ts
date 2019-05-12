import { ContextContainer } from "./config/context/ApplicationContext";
import { RequestContext } from "./config/context/RequestContext";

/**
 * An unpleasant bit of hackery to make Awilix play nice with bound functions.
 * Relies on some pretty specific implementation details in Awilix, so probably
 * pretty brittle. This is necessary to facilitate CLASSIC mode injection, as it
 * does some parsing of the function's toString() result.
 * @param instance - The class instance to bind the function to (to preserve
 *    `this` semantics)
 * @param method - The method to wrap.
 * @return A modified version of method.bind(instance) that is friendly towards
 *    Awilix's notion of a "function".
 * @example container.build(asClassMethod(someService, someService.someMethod))
 */
export function asClassMethod<T>(
  instance: any,
  method: (...args: any[]) => T
): (...args: any[]) => T {
  // Bind the function to the instance, so that `this` is correctly set.
  const injectable = method.bind(instance);
  // Function.name is read-only, so modify its property descriptor directly.
  // otherwise it gets left with something like "bound ${name}"
  Object.getOwnPropertyDescriptor(injectable, "name").value = method.name;
  makeProxyAwilixFriendly(injectable, method);
  return injectable;
}

/**
 * Create a resolver for a static class method.
 * @param method The static method to register
 * @example container.build(asStaticMethod(SomeClass.someStaticMethod))
 */
export function asStaticMethod(method: (...args: any[]) => any) {
  // Create a proxy function so we don't pollute the real function's
  // toString() method.
  const injectable = (...args: any[]) => method(...args);
  makeProxyAwilixFriendly(injectable, method);
  return injectable;
}

/* Private Functions */
/**
 * When Awilix is parsing functions for classic mode DI injection, it analyzes
 * the result of `fn.toString()`. This does not play well with typescript class
 * methods since their toString method looks like `functionName(args)` instead of
 * `function functionName(args)` or `(args) =>`. This function attaches a
 * toString() method to the given injectable proxy, which provides a result
 * that can be properly parsed for classic DI injection.
 * @param injectable - The proxy to modify.
 * @param realFunction - The underlying function to proxy for injection.
 */
function makeProxyAwilixFriendly(
  injectable: (...args: any[]) => any,
  realFunction: (...args: any[]) => any
) {
  injectable.toString = () => {
    let result = realFunction.toString();
    let prefix = "function";
    if (result.startsWith("async")) {
      result = result.replace(/async/, "");
      prefix = "async " + prefix;
    }
    return prefix + " " + result;
  };
}

/**
 * Apply the ContainerAware mixin to this class. You must provide this.container
 * @provides buildMethod
 * @example
 * ```
 * @MakeContainerAware()
 * export class SomeClass {
 *
 * }
 * export interface SomeClass extends ContainerAware {}
 * ```
 */
export const MakeContainerAware: () => ClassDecorator = () => (
  target: Function
) => {
  target.prototype.buildMethod = ContainerAware.prototype.buildMethod;
};

/**
 * Container aware class. Available as a base class, or mixin via
 * @MakeContainerAware()
 */
export abstract class ContainerAware {
  protected container: ContextContainer<any>;
  constructor(container: ContextContainer<any>) {
    this.container = container;
  }
  /**
   * Construct the provided method using this instance's container.
   * @param fn - A method on this object to build.
   */
  buildMethod<T extends (context: RequestContext) => any>(
    fn: T
  ): ReturnType<T> {
    return this.container.build(asClassMethod(this, fn));
  }
}
