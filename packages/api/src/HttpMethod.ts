export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PATCH = "PATCH",
  PUT = "PUT",
  DELETE = "DELETE",
  OPTIONS = "OPTIONS"
}

/**
 * Convert a string http method to an HttpMethod enum member.
 * @param method - One of "GET", "POST", etc.
 * @return The matching HttpMethod, or undefined if it is unknown.
 */
export function getMethod(method: string): HttpMethod {
  if (HttpMethod.hasOwnProperty(method)) {
    return (HttpMethod as any)[method];
  }
}
