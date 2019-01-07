import { AxiosError } from "axios";
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

/**
 * Axios error typeguard.
 */
export function isAxiosError(e: any): e is AxiosError {
  if (!e || !e.hasOwnProperty) {
    return false;
  }
  const hasRequestResponse = Boolean(e.request || e.response);
  const hasErroneousStatusCode =
    e.hasOwnProperty("code") && (e.code < 200 || e.code >= 300);
  return hasRequestResponse && hasErroneousStatusCode;
}

/**
 * Determine if the provided API response object is a token expiration error.
 * @param response - The API response object.
 */
export function isTokenExpiredResponse(response: any) {
  // TODO: Move these nice error names out to constants
  return response && response.error === "AuthenticationTokenExpiredError";
}
