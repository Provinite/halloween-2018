import { Omit } from "./Omit";

/**
 * Used to express a type that includes all of the keys of P, overridden by
 * the keys of K. For example, to enforce some keys, but allow any:
 * @example
 * const paths : Definitely<{[key: string]: Path}, {
 *  root: Path
 * }> = { . . . }
 */
export type Definitely<P, K> = Omit<P, keyof K> & K;
