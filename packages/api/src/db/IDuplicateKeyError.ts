export interface IDuplicateKeyError {
  code: string;
  column: string;
  detail?: string;
}
