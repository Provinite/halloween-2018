import { ICodedError } from "./ICodedException";
import { PostgresErrorCodes } from "./PostgresErrorCodes";

/**
 * Determine if the given error is a coded exception (eg: a real
 * postgres error)
 * @param e The thrown error.
 */
export function isCodedException(e: any): e is ICodedError {
  return e instanceof Object && Object.keys(e).includes("code");
}

/**
 * Determine if the given error is a postgres duplicate key exception.
 * @param e The thrown error.
 */
export function isDuplicateKeyException(e: any): e is ICodedError {
  return isCodedException(e) && e.code === PostgresErrorCodes.duplicateKey;
}
