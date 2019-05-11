/**
 * Type for errors thrown by Postgres on a duplicate key exception.
 */
export interface IDuplicateKeyError {
  code: string;
  column: string;
  detail?: string;
}
