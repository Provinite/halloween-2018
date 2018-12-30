import { HttpMethod } from "../HttpMethod";

/**
 * Error indicating that the requested method is not supported for this route.
 */
export class MethodNotSupportedError extends Error {
  /**
   * Array of allowed http methods for the route.
   */
  readonly allow: HttpMethod[];
  constructor(allow: HttpMethod[]) {
    super();
    this.allow = allow;
  }
}
