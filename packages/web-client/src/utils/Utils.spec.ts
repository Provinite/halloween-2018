import {
  ensureNoTrailingSlash,
  ensureTrailingSlash,
  handlerFactory
} from "./Utils";
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

  describe("function:handlerFactory", () => {
    it("produces stable outputs given stable inputs", () => {
      const handler = jest.fn();
      const factory = handlerFactory(handler);

      const fooHandler = factory("foo");
      const barHandler = factory("bar");
      expect(fooHandler).toBe(factory("foo"));
      expect(barHandler).toBe(factory("bar"));
    });

    it("invokes the underlying function with all args and returns the value", () => {
      const handler = jest.fn().mockReturnValue("baz");
      const factory = handlerFactory(handler);
      const eventHandler = factory("foo");
      expect(handler).toHaveBeenCalledTimes(0);
      const baz = eventHandler("bar");
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith("foo", "bar");
      expect(baz).toEqual("baz");
    });
  });
});
