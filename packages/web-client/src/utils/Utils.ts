import * as fastMemoize from "fast-memoize";

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
