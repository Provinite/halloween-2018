import { ROLES } from "@clovercoin/constants";
import { asValue, createContainer, InjectionMode } from "awilix";
import { RoleLiteral } from "../auth/RoleLiteral";

/**
 * Convert an object of names to functions to getters that invoke the
 * specified function and return its result.
 * @param map - The object to convert. Will not be modified.
 * @example
 * const admin = () => ({name: ROLES.admin});
 * const user = () => ({name: ROLES.user});
 * export const mockRoles = makeGetterObject({admin, user});
 */
export function makeGetterObject<T extends Record<keyof T, () => any>>(
  map: T
): { [key in keyof T]: ReturnType<T[key]> } {
  const result: any = {};
  for (const [key, getter] of Object.entries<() => any>(map)) {
    Object.defineProperty(result, key, {
      get: getter,
      enumerable: true
    });
  }
  return result;
}

/**
 * Shorthand for a spec that runs once for each role literal
 * @param name - The test name.
 * @param spec - The spec itself.
 */
export function roleLiteralSpec(
  name: string,
  spec: (roleName: RoleLiteral) => any,
  exclude: RoleLiteral[] = []
) {
  const roleNames: RoleLiteral[] = [
    ...(Object.keys(ROLES) as RoleLiteral[]),
    "public"
  ];
  const it = (global as any).it;
  const filteredRoleNames = roleNames.filter(
    roleName => exclude.indexOf(roleName) === -1
  );
  it.each(filteredRoleNames)(name, spec);
}

/**
 * Create a deferred promise.
 */
export function createDeferred<T = any>() {
  let resolve: (value?: T | PromiseLike<T>) => void;
  let reject: (reason: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { resolve, reject, promise };
}

/**
 * Register each entry of the map to the provided Awilix container.
 */
export function createTestContainer(map: { [key: string]: any }) {
  const container = createContainer({ injectionMode: InjectionMode.CLASSIC });
  for (const [key, value] of Object.entries(map)) {
    container.register(key, asValue(value));
  }
  return container;
}

/**
 * Creates an object mimicing the ApplicationContext object's behavior. Useful
 * for testing components and ensuring that changes in dependencies are caught
 * by automated tests.
 * @param [ctx] - The initial context, defaults to an empty object.
 * @return A proxy wrapping `ctx`. The proxy allows writes to any key, but
 * instead of returning `undefined` on accessing a nonexistent property, it
 * throws an UnknownDependencyError
 */
export function createSafeContext<T extends {}>(ctx?: T): T {
  return new Proxy<T>(ctx || ({} as T), {
    get: (target, prop, receiver) => {
      if (prop in target) {
        return (target as any)[prop];
      } else {
        throw new UnknownDependencyError(
          "Could not resolve: `" + prop.toString() + "`"
        );
      }
    }
  });
}

/** Error indicating a test context was queried for an unknown dependency. */
export class UnknownDependencyError extends Error {}
