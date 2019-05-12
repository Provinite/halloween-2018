import { Assign, Omit } from "@clovercoin/constants";
import {
  AwilixContainer,
  BuildResolverOptions,
  ClassOrFunctionReturning,
  ResolveOptions,
  Resolver
} from "awilix";
import { RequestContext } from "./RequestContext";

declare global {
  /**
   * Add members to this interface that should be present in the root scope DI
   * context. Do not use this type to consume a context, instead
   * @see ApplicationContext
   *
   * @example
   * // inside of a module
   * // @Component()
   * export class SomeClass { . . . }
   * declare global {
   *   interface ApplicationContextMembers {
   *     someClass: SomeClass;
   *   }
   * }
   */
  // tslint:disable-next-line:no-empty-interface
  interface ApplicationContextMembers {}
}

export type AnyContext = ApplicationContext | RequestContext;
export type AnyContainer = ContextContainer<AnyContext>;

export interface ContextContainer<ContextType>
  extends Assign<
    Omit<AwilixContainer, "register" | "createScope">,
    {
      cradle: ContextType;
      build<U>(fn: (context: ContextType) => U): U;
      build<T>(
        targetOrResolver: ClassOrFunctionReturning<T> | Resolver<T>,
        opts?: BuildResolverOptions<T>
      ): T;
      resolve<K extends keyof ContextType>(
        name: K,
        resolveOptions?: ResolveOptions
      ): ContextType[K];
      resolve<T>(name: string | symbol, resolveOptions?: ResolveOptions): T;
    }
  > {
  // this is defined down here to allow for access to "this" type
  register<K extends keyof ContextType, T extends ContextType[K]>(
    name: K,
    registration: Resolver<T>
  ): this;
  createScope<T extends ContextContainer<any>>(): T;
  createScope(): this;
}
/**
 * Type of the root DI container's context.
 * @example
 * doSomeSetup({ prizeRepository }: RequestContext) {. . .}
 */
// tslint:disable-next-line:no-empty-interface
export interface ApplicationContext extends ApplicationContextMembers {}

/**
 * Type of the root level application's container
 */
export interface ApplicationContainer
  extends ContextContainer<ApplicationContext> {}
