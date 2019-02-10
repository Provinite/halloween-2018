import { AxiosError } from "axios";
import * as fastMemoize from "fast-memoize";
import { ArgumentTypes } from "../types/ArgumentTypes";

/**
 * Trim up to 1 forward slash from the end of a string.
 * @param str
 * @return str without a trailing slash.
 */
export function ensureNoTrailingSlash(str: string) {
  return str.replace(/\/+$/, "");
}

/**
 * Ensure that the given string ends with a trailing slash.
 * @param str
 * @return str with a trailing slash.
 */
export function ensureTrailingSlash(str: string) {
  return str.endsWith("/") ? str : `${str}/`;
}

/**
 * Memoize helper.
 */
export const memoize: typeof fastMemoize.default = fastMemoize as any;

/**
 * Axios error typeguard.
 */
export function isAxiosError(e: any): e is AxiosError {
  if (!e || !e.hasOwnProperty) {
    return false;
  }
  const hasRequestResponse = Boolean(e.request || e.response);
  const hasErroneousStatusCode =
    e.hasOwnProperty("code") && (e.code < 200 || e.code >= 300);
  return hasRequestResponse && hasErroneousStatusCode;
}

/**
 * Determine if the provided API response object is a token expiration error.
 * @param response - The API response object.
 */
export function isTokenExpiredResponse(response: any) {
  // TODO: Move these nice error names out to constants
  return response && response.error === "AuthenticationTokenExpiredError";
}

/**
 * Type representing a wrapper that curries the provided function type with
 * event arguments.
 * @param F - The type of the actual function.
 * @param EventArgs - The type of any args that will be provided to the
 *    courier.
 */
type EventHandlerFactory<F extends (...args: any[]) => any> = (
  ...args: ArgumentTypes<F>
) => (...eventArgs: any[]) => ReturnType<F>;

/**
 * Create a memoized event handler factory using the provided function.
 * @param <F> - The type of the input function.
 * @param handler - The event handler function.
 * @return A memoized event handler factory.
 * @example The most common use case for this function is as an event handler in react components.
 * // Note that the input function's arguments will be used for
 * // the resulting factory. This means that any args coming at the actual
 * // event invocation time will need to be optional. This typing could
 * // probably be improved
 * handleClick = handlerFactory((name: string, e?: MouseEvent) => {
 *  // inside the body of our function, we have access to all of the args at
 *  // once
 *  if (isLeftClick(e)) {
 *    alert(`Left clicked ${name}`);
 *  }
 * })
 * // . . .
 * render() {
 *  // here we can provide the name now, and let the actual
 *  // invocation provide the event arg. Note this is also
 *  // safe from unnecessary propchanges since the handleClick factory
 *  // is memoized.
 *  return <button onClick={this.handleClick("someName")} />
 * }
 *
 * @example
 * // using the same definition as before
 * handleClick = handlerFactory(...); // handleClick is a factory
 *
 * const eventHandler = this.handleClick("foo"); // invoke it to get a handler
 * const otherEventHandler = this.handleClick("foo");
 * // it's memoized, so identity is retained between calls
 * expect(eventHandler === otherEventHandler).toEqual(true);
 * eventHandler(someEventObject); // invoke the handler to finally run the actual input function
 */
export function handlerFactory<F extends (...args: any[]) => any>(
  handler: F
): EventHandlerFactory<F> {
  const factoryWrapper = (...args: ArgumentTypes<F>) => (...eventArgs: any[]) =>
    handler(...args, ...eventArgs);
  const memoizedFactory = memoize(factoryWrapper, {
    strategy: memoize.strategies.variadic
  });
  return memoizedFactory;
}
