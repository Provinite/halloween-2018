import { isCodedException, isDuplicateKeyException } from "./OrmExceptions";
import { PostgresErrorCodes } from "./PostgresErrorCodes";

describe("OrmExceptions", () => {
  describe("function:isCodedException", () => {
    it("identifies coded exceptions", () => {
      const exception = {
        code: "123",
        message: "some message",
        name: "someErrorName"
      } as unknown;
      expect(isCodedException(exception)).toBe(true);
      if (isCodedException(exception)) {
        // ensure the type-guard works
        const code = exception.code;
        expect(code).toBe("123");
      }
    });
    it("identifies non-coded exceptions", () => {
      const exception = new Error("not a coded error!");
      expect(isCodedException(exception)).toBe(false);
    });
    it("doesn't blow up on primitives", () => {
      expect(isCodedException("123")).toBe(false);
      expect(isCodedException(1)).toBe(false);
      expect(isCodedException(1.5)).toBe(false);
      expect(isCodedException([])).toBe(false);
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
      expect(isDuplicateKeyException(otherException)).toBe(false);
      expect(isDuplicateKeyException(exception)).toBe(true);
      if (isDuplicateKeyException(exception)) {
        expect(exception.code).toBe(PostgresErrorCodes.duplicateKey);
      }
    });
  });
});
