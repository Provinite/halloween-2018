import { Assign } from "@clovercoin/constants";
import { ApplicationContext, ContextContainer } from "./ApplicationContext";

declare global {
  /**
   * Add members to this interface that should be present in request-scoped
   * contexts. Do not use this type to consume a request context, instead
   * @see RequestContext
   *
   * @example
   * // inside of a module
   * // @Component()
   * export class SomeClass { . . . }
   * declare global {
   *   interface RequestContextMembers {
   *     someClass: SomeClass;
   *   }
   * }
   */
  // tslint:disable-next-line:no-empty-interface
  interface RequestContextMembers {}
}

/**
 * Type of the context object that will be provided to request-scoped methods
 * managed by DI.
 * @example
 * // @route(. . .)
 * handleRequest({ prizeRepository, prizeAuthorizationService }: RequestContext)
 */
export interface RequestContext
  extends Assign<ApplicationContext, RequestContextMembers> {}

/**
 * Type of the request context container
 */
export interface RequestContainer extends ContextContainer<RequestContext> {}

/**
 * Type for overwriting T onto a request context.
 */
export type EnhancedRequestContext<T> = Assign<RequestContext, T> & {
  container: ContextContainer<Assign<RequestContext, T>>;
};
