import {
  isPresent,
  isValidDateString,
  isValidDateTimeString,
  isValidFloat,
  isValidInt,
  RequestValidationError,
  validateRequest,
  validationResult
} from "./RequestValidationUtils";

describe("RequestValidationUtils", () => {
  describe("validateRequest", () => {
    it("throws a validation error if any validators fail", () => {
      const data = {
        name: "theodore",
        age: "-1"
      };
      const validators = {
        name: (name: string) =>
          validationResult(Boolean(name), "Name is required"),
        age: (ageString: string) => {
          const age = Number.parseInt(ageString, 10);
          return validationResult(
            age > 0 && age < 100,
            "Age must be between 0 and 100"
          );
        }
      };
      try {
        validateRequest(data, validators);
        throw new Error("The above line should have thrown ^");
      } catch (e) {
        expect(e).toBeInstanceOf(RequestValidationError);
        const err = e as RequestValidationError<keyof typeof data>;
        expect(err.erroredResults.age).toEqual({
          pass: false,
          message: "Age must be between 0 and 100"
        });
        expect(err.erroredResults.name).toBeUndefined();
      }
    });
    it("returns the keys selected off of the request body", () => {
      const data = {
        name: "timmy",
        age: "123",
        maliciousKey: "' DROP TABLE HAX --"
      };
      const validators = {
        name: undefined as any,
        age: undefined as any
      };
      const result = validateRequest(data, validators);
      expect(result).toEqual({
        name: "timmy",
        age: "123"
      });
      expect(result.hasOwnProperty("maliciousKey")).toBe(false);
    });
    it("treats undefined as a tautological validator", () => {
      const data = {
        name: "foo",
        age: "bar"
      };
      const validators = {
        name: undefined as any,
        age: undefined as any
      };
      const result = validateRequest(data, validators);
      expect(result).toEqual(data);
    });
  });
  describe("isValidInt", () => {
    it.each([
      [1, true],
      [0, true],
      [-1, true],
      [1.0, true],
      [1.1, false],
      ["1", false],
      [null, false],
      [undefined, false],
      [0.2, false],
      [{}, false],
      [[], false]
    ])("isValidInt(%p) === %p", (val, expectedResult) => {
      expect(isValidInt(val)).toBe(expectedResult);
    });
  });
  describe("isValidFloat", () => {
    it.each([
      [1, true],
      [0, true],
      [-1, true],
      [1.0, true],
      [+1.1, true],
      ["1", false],
      ["1.1", false],
      [-1.2, true],
      [null, false],
      [undefined, false],
      [{}, false],
      [[], false]
    ])("isValidFloat(%p) === %p", (val, expectedResult) => {
      expect(isValidFloat(val)).toBe(expectedResult);
    });
  });
  describe("isPresent", () => {
    it("identifies undefined values as not present", () => {
      const data = { foo: undefined } as any;
      expect(isPresent(data.foo)).toBe(false);
      expect(isPresent(data.bar)).toBe(false);
    });
    it.each(["", 0, false, 1, 100, new Date(), "zoop", {}, true, null])(
      "treats %p as present",
      value => {
        const data = { value };
        expect(isPresent(data.value)).toBe(true);
      }
    );
  });
  describe("isValidDateString", () => {
    it.each(["2010-01-01", "2019-02-21", "2001-06-04", "1992-03-10"])(
      "%p is valid",
      validDateString => {
        expect(isValidDateString(validDateString)).toBe(true);
      }
    );
    it.each([
      "2010-00-01",
      "10-1-1",
      "92-01-01",
      "2017-02-29",
      "2010-1-1",
      "Jan 6th, 1998",
      "not a thing",
      1,
      false,
      null,
      new Date()
    ])("%p is invalid", invalidDateString => {
      expect(isValidDateString(invalidDateString)).toBe(false);
    });
  });
  describe("isValidDateTimeString", () => {
    it.each(["2019-01-01 13:45:06", "2020-07-04 22:19:16"])(
      "%p is valid",
      validDateTimeString => {
        expect(isValidDateTimeString(validDateTimeString)).toBe(true);
      }
    );
    it.each(["2020-07-04 25:19:00", "92-06-04 12:00:00", "2019-04-11 00:00:1"])(
      "%p is invalid",
      invalidDateTimeString => {
        expect(isValidDateTimeString(invalidDateTimeString)).toBe(false);
      }
    );
  });
});
