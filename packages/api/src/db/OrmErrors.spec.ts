import { isCodedError, isDuplicateKeyError } from "./OrmErrors";
import { PostgresErrorCodes } from "./PostgresErrorCodes";

describe("OrmExceptions", () => {
  describe("function:isCodedException", () => {
    it("identifies coded exceptions", () => {
      const exception = {
        code: "123",
        message: "some message",
        name: "someErrorName"
      } as unknown;
      expect(isCodedError(exception)).toBe(true);
      if (isCodedError(exception)) {
        // ensure the type-guard works
        const code = exception.code;
        expect(code).toBe("123");
      }
    });
    it("identifies non-coded exceptions", () => {
      const exception = new Error("not a coded error!");
      expect(isCodedError(exception)).toBe(false);
    });
    it("doesn't blow up on primitives", () => {
      expect(isCodedError("123")).toBe(false);
      expect(isCodedError(1)).toBe(false);
      expect(isCodedError(1.5)).toBe(false);
      expect(isCodedError([])).toBe(false);
    });
  });
  describe("function:isDuplicateKeyException", () => {
    it("identifies duplicate key exceptions by their code", () => {
      const exception = {
        code: PostgresErrorCodes.duplicateKey
      } as unknown;
      const otherException = {
        code: "some_other_code"
      } as unknown;
      expect(isDuplicateKeyError(otherException)).toBe(false);
      expect(isDuplicateKeyError(exception)).toBe(true);
      if (isDuplicateKeyError(exception)) {
        expect(exception.code).toBe(PostgresErrorCodes.duplicateKey);
      }
    });
  });
});
