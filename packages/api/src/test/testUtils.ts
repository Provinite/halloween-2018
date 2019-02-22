import { ROLES } from "@clovercoin/constants";
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
