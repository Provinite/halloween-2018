import { ICodedError } from "./ICodedError";
import { IDuplicateKeyError } from "./IDuplicateKeyError";
import { PostgresErrorCodes } from "./PostgresErrorCodes";

/**
 * Determine if the given error is a coded exception (eg: a real
 * postgres error)
 * @param e The thrown error.
 */
export function isCodedError(e: any): e is ICodedError {
  return e instanceof Object && Object.keys(e).includes("code");
}

/**
 * Determine if the given error is a postgres duplicate key exception.
 * @param e The thrown error.
 */
export function isDuplicateKeyError(e: any): e is IDuplicateKeyError {
  return isCodedError(e) && e.code === PostgresErrorCodes.duplicateKey;
}
