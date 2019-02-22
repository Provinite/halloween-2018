import * as moment from "moment";

export type ValidationResult = {
  pass: boolean;
  message: string;
};
export type ValidatorFunction<Keys extends string, K extends Keys> = (
  val: any,
  key: K,
  obj?: Partial<Record<K, string>>
) => ValidationResult;
export type ValidationFor<Keys extends string> = {
  [key in Keys]: ValidatorFunction<Keys, key> | undefined
};
/**
 * Validate an incoming request body.
 * @param requestBody - The incoming request body.
 * @param validators - A map of validator functions for each key that will
 *  be picked off of requestBody.
 * @throws RequestValidationError if any validators fail.
 */
export function validateRequest<Keys extends string>(
  requestBody: any,
  validators: ValidationFor<Keys>
) {
  const alwaysPass = () => validationResult(true, "No validation rules.");
  const keys = Object.keys(validators) as Keys[];
  const body = pickRequestKeys(requestBody, ...keys);
  const errorResults: Partial<Record<Keys, ValidationResult>> = {};
  let failed = false;
  for (const key of keys) {
    const validator =
      validators[key] === undefined ? alwaysPass : validators[key];
    const result = validator(requestBody[key], key, body);
    if (result.pass !== true) {
      failed = true;
      errorResults[key] = result;
    }
  }
  if (failed === true) {
    throw new RequestValidationError(errorResults);
  }
  return body;
}

export function validateValue(
  value: any,
  name: string,
  validator: (val: any, name: string) => ValidationResult
) {
  const result = validator(value, name as any);
  if (result.pass === false) {
    throw new RequestValidationError({ [name]: result });
  }
  return value;
}

/**
 * Used to select specific known keys from an incoming request body.
 * @param requestBody - Cannot be null or undefined.
 * @param keys - The keys to extract.
 * @return An object containing the specified keys from requestBody.
 */
export function pickRequestKeys<T, K extends string>(
  requestBody: any,
  ...keys: K[]
): Partial<Record<K, any>> {
  const result = {} as any;
  for (const key of keys) {
    if (requestBody.hasOwnProperty(key)) {
      result[key] = requestBody[key];
    }
  }
  return result;
}

/**
 * Create a validation result.
 * @param pass - True if the test passed.
 * @param message - The message to display for failures.
 */
export function validationResult(
  pass: boolean,
  message: string
): ValidationResult {
  return {
    pass,
    message
  };
}

/**
 * Determine if the value is a string of only or more digits.
 * @param val - The value to test.
 * @return true iff val is a string that consists only of one or more digits.
 */
export function isDigitString(val: any) {
  if (typeof val !== "string") {
    return false;
  }
  return /^\d+$/.test(val);
}

/**
 * Check if a string consists
 * @param val
 */
export function isValidInt(val: any) {
  if (typeof val !== "number") {
    return false;
  }
  return Number.isInteger(val);
}

export function isValidFloat(val: any) {
  return typeof val === "number";
}

export function isPresent<T>(val: T): val is NonNullable<T> {
  return val !== undefined && val !== null;
}

export function isString(val: any): val is string {
  return typeof val === "string";
}

export function isValidDateString(val: any): val is string {
  if (typeof val !== "string") {
    return false;
  }
  return moment(val, "YYYY-MM-DD", true).isValid();
}

export function isValidDateTimeString(val: any): val is string {
  if (typeof val !== "string") {
    return false;
  }
  return moment(val, "YYYY-MM-DD HH:mm:ss", true).isValid();
}

/**
 * Error thrown to indicate a request validation failed.
 */
export class RequestValidationError<Keys extends string> extends Error {
  constructor(
    /**
     * Each key that failed validation will have a ValidationResult in this
     * object.
     */
    public erroredResults: { [key in Keys]?: ValidationResult }
  ) {
    super(
      `Validation failed for field(s): ${Object.keys(erroredResults).join(
        ", "
      )}`
    );
  }
}

const requiredString = (val: any, key: string) => {
  return validationResult(
    isString(val),
    `${key} is required and must be a string.`
  );
};
const optionalString = (val: any, key: string) => {
  const result = !isPresent(val) || isString(val);
  return validationResult(result, `${key} must be a string.`);
};
const optionalDateString = (val: any, key: string) => {
  const result = !isPresent(val) || isValidDateString(val);
  return validationResult(result, `${key} must be a valid date (YYYY-MM-DD).`);
};
const optionalInt = (val: any, key: string) => {
  const result = !isPresent(val) || isValidInt(val);
  return validationResult(result, `${key} must be a whole number`);
};
const optionalFloat = (val: any, key: string) => {
  const result = !isPresent(val) || isValidFloat(val);
  return validationResult(result, `${key} must be a valid decimal number.`);
};
const requiredDigitString = (val: any, key: string) => {
  const result = isPresent(val) && isDigitString(val);
  return validationResult(result, `${key} must be a string of only digits.`);
};

/**
 * Canned generic validators.
 */
export const validators = {
  requiredString,
  optionalString,
  optionalDateString,
  optionalInt,
  optionalFloat,
  requiredDigitString
};
