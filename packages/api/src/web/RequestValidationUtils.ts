import * as moment from "moment";

export type ValidationResult = {
  pass: boolean;
  message: string;
};
export type ValidatorFunction<Keys extends string> = (
  val: any,
  key: string,
  obj?: Partial<Record<Keys, string>>
) => ValidationResult;
export type TypedValidatorFunction<Keys extends string, R> = ValidatorFunction<
  Keys
> & {
  __returntype: R;
};
export type ValidationFor<Keys extends string> = {
  [key in Keys]:
    | ValidatorFunction<Keys>
    | undefined
    | TypedValidatorFunction<Keys, any>
};
export type ValidatedRequestBody<V extends ValidationFor<any>> = {
  [key in keyof V]: V[key] extends TypedValidatorFunction<any, infer U>
    ? U
    : any
};
/**
 * Validate an incoming request body.
 * @param requestBody - The incoming request body.
 * @param validators - A map of validator functions for each key that will
 *  be picked off of requestBody.
 * @throws RequestValidationError if any validators fail.
 */
export function validateRequest<
  Keys extends string,
  T extends ValidationFor<Keys>
>(requestBody: any, validators: T): ValidatedRequestBody<T> {
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
  return body as any;
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

export type CreateValidatorOptions<T> = {
  optional: boolean;
  nullable: boolean;
  validator: TypedValidatorFunction<string, T>;
};
export function createValidator<R = any>(
  options: CreateValidatorOptions<R>
): TypedValidatorFunction<string, R> {
  return ((val: any, key: string, obj: any) => {
    if (val === undefined) {
      return validationResult(
        options.optional,
        `Missing required field: "${key}".`
      );
    }
    if (val === null) {
      return validationResult(options.nullable, `"${key}" cannot be empty.`);
    }
    return options.validator(val, key, obj);
  }) as any;
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
  return typeof val === "number" && !Number.isNaN(val);
}

export function isPresent<T>(val: T): val is Exclude<T, undefined> {
  return val !== undefined;
}

export function isString(val: any): val is string {
  return typeof val === "string";
}

export function isNonEmptyString(val: any): boolean {
  return typeof val === "string" && val.length > 0;
}

export function isValidDateString(val: any): val is string {
  if (typeof val !== "string" || !val) {
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
const requiredNonEmptyString = (val: any, key: string) =>
  validationResult(isNonEmptyString(val), `${key} must be a non empty string`);
const requiredDateString = (val: any, key: string) => {
  const result = isValidDateString(val);
  return validationResult(result, `${key} must be a valid date (YYYY-MM-DD).`);
};

const requiredFloat = (val: any, key: string) => {
  const result = isValidFloat(val);
  return validationResult(result, `"${key}" must be a valid decimal number.`);
};
const requiredDigitString = (val: any, key: string) => {
  return validationResult(
    isDigitString(val),
    `${key} must be a string of only digits.`
  );
};
const requiredInt = (val: any, key: string) => {
  return validationResult(
    isValidInt(val),
    `"${key}" must be a valid whole number.`
  );
};
const requiredUndefined = (val: any, key: string) => {
  return validationResult(val === undefined, `Field not allowed: "${key}"`);
};
const rootValidators = {
  integer: requiredInt as TypedValidatorFunction<string, number>,
  digitString: requiredDigitString as TypedValidatorFunction<string, string>,
  string: requiredString as TypedValidatorFunction<string, string>,
  nonEmptyString: requiredNonEmptyString as TypedValidatorFunction<
    string,
    string
  >,
  notAllowed: requiredUndefined as TypedValidatorFunction<string, never>,
  float: requiredFloat as TypedValidatorFunction<string, number>,
  dateString: requiredDateString as TypedValidatorFunction<string, string>
};

type RootValidators = typeof rootValidators;
type OptionalValidators = {
  [key in keyof RootValidators]: RootValidators[key] extends TypedValidatorFunction<
    string,
    infer U
  >
    ? TypedValidatorFunction<string, U | undefined>
    : never
} & {
  nullable: OptionalAndNullableValidators;
};
type NullableValidators = {
  [key in keyof RootValidators]: RootValidators[key] extends TypedValidatorFunction<
    string,
    infer U
  >
    ? TypedValidatorFunction<string, U | null>
    : never
} & {
  optional: OptionalAndNullableValidators;
};
type OptionalAndNullableValidators = {
  [key in keyof RootValidators]: RootValidators[key] extends TypedValidatorFunction<
    string,
    infer U
  >
    ? TypedValidatorFunction<string, U | null | undefined>
    : never
};
type OptionalNullableValidators = RootValidators & {
  optional: OptionalValidators;
  nullable: NullableValidators;
};

const optionalValidators = {} as any;
const nullableValidators = {} as any;
const optionalNullableValidators = {} as any;
for (const [key, validator] of Object.entries(rootValidators)) {
  optionalValidators[key] = createValidator({
    optional: true,
    nullable: false,
    validator: validator as any
  });
  nullableValidators[key] = createValidator({
    optional: false,
    nullable: true,
    validator: validator as any
  });
  optionalNullableValidators[key] = createValidator({
    optional: true,
    nullable: true,
    validator: validator as any
  });
}
export const validators: OptionalNullableValidators = {
  ...rootValidators,
  optional: {
    ...optionalValidators,
    nullable: optionalNullableValidators
  },
  nullable: {
    ...nullableValidators,
    optional: optionalNullableValidators
  }
};
