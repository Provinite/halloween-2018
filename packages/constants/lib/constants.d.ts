declare module "@clovercoin/constants" {
  /**
   * An object mapping named roles to string literals.
   */
  export const ROLES: {
    admin: string;
    moderator: string;
    user: string;
  }
  export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;
  /**
  * The type T with all keys optional except those specified.
  */
  export type PartialExcept<T, K extends keyof T> = Omit<Partial<T>, K> &
    Pick<T, K>;
  export type PartialKeys<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

  /**
   * The argument types of the functional type T
   */
  export type ArgumentTypes<T> = T extends (...args: infer U) => infer R
  ? U
  : never;
}