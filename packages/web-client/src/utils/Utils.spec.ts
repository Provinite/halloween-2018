import { ensureNoTrailingSlash, ensureTrailingSlash } from "./Utils";
describe("utils", () => {
  const expectToBeIdempotent = (
    fn: (...args: any[]) => any,
    ...args: any[]
  ) => {
    const firstResult = fn(...args);
    expect(fn(fn(firstResult))).toEqual(firstResult);
  };

  describe("function:ensureNoTrailingSlash", () => {
    const testCases = [["foo/", "foo"], ["foo", "foo"], ["foo//", "foo"]];
    testCases.forEach(([provided, expected]) => {
      describe(`with ${provided}`, () => {
        it("trims trailing slashes", () => {
          expect(ensureNoTrailingSlash(provided)).toBe(expected);
        });
        it("is idempotent", () => {
          expectToBeIdempotent(ensureNoTrailingSlash, provided);
        });
      });
    });
  });

  describe("function:ensureTrailingSlash", () => {
    const testCases = [["foo", "foo/"], ["foo/", "foo/"]];
    testCases.forEach(([provided, theUnexpected]) => {
      describe(`with ${provided}`, () => {
        it("adds a trailing slash if there is not one", () => {
          expect(ensureTrailingSlash(provided)).toBe(theUnexpected);
        });
        it("is idempotent", () => {
          expectToBeIdempotent(ensureTrailingSlash, provided);
        });
      });
    });
  });
});
