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
 */
export function asClassMethod(
  instance: any,
  method: (...args: any[]) => any
): (...args: any[]) => any {
  const injectable = method.bind(instance);
  // Awilix looks for something like "function ${name}" to begin parsing
  // so we just mock it up like that.
  // Function.name is read-only, so modify its property descriptor directly.
  Object.getOwnPropertyDescriptor(injectable, "name").value = method.name;
  injectable.toString = () => "function " + method.toString();
  return injectable;
}
