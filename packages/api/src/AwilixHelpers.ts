import { ContextContainer } from "./config/context/ApplicationContext";
import { RequestContext } from "./config/context/RequestContext";

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
    const func = fn.bind(this) as T;
    return this.container.build(func);
  }
}
