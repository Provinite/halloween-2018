import * as Awilix from "awilix";
import {
  ApplicationContainer,
  ContextContainer
} from "./config/context/ApplicationContext";
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
  public container: ContextContainer<any>;
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
    return this.container.build(bind(fn, this));
  }
}

/**
 * Type-safe `function#bind`
 * @param fn - The function to bind
 * @param thisArg - The `this` value for the bound function
 */
export function bind<T extends (this: U, ...args: any) => any, U>(
  fn: T,
  thisArg: any
) {
  return fn.bind(thisArg) as T;
}

export function createContainer<T>(): ContextContainer<T> {
  return Awilix.createContainer() as ContextContainer<T>;
}

export function createApplicationContainer(): ApplicationContainer {
  return Awilix.createContainer() as ApplicationContainer;
}
