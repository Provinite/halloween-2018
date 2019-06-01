import {
  createSafeContext,
  makeGetterObject,
  getThrownError
} from "./testUtils";

describe("utils: test", () => {
  describe("makeGetterObject", () => {
    it("invokes the underlying functions on read", () => {
      const read = jest.fn();
      const result = makeGetterObject({ read });
      expect(read).toHaveBeenCalledTimes(0);
      /* tslint:disable no-unused-expression */
      result.read;
      result.read;
      result.read;
      /* tslint:enable no-unused-expression */
      expect(read).toHaveBeenCalledTimes(3);
    });
    it("creates an object with safe getters", () => {
      const mockData = makeGetterObject({
        read: () => ({ name: "Tom Clancy", rainbow: 6 })
      });
      const result = mockData.read;
      result.name = "Tomasz Boonty";
      result.rainbow = 7;
      const fresh = mockData.read;
      expect(fresh).not.toBe(result);
      expect(fresh).toEqual({ name: "Tom Clancy", rainbow: 6 });
      expect(result).toEqual({
        name: "Tomasz Boonty",
        rainbow: 7
      });
    });
  });
  describe("createSafeContext", () => {
    const originalFoo = "foo";
    const originalBar = 1;
    let ctx: { foo: string; bar: number };
    let proxy: typeof ctx;
    beforeEach(() => {
      ctx = {
        foo: originalFoo,
        bar: originalBar
      };
      proxy = createSafeContext(ctx);
    });
    it("allows reads from provided ctx", () => {
      expect(proxy.foo).toEqual(originalFoo);
      ctx.foo = "mockFoo";
      expect(proxy.foo).toEqual("mockFoo");
    });
    it("allows writes to known keys", () => {
      proxy.foo = "mockFoo";
      expect(proxy.foo).toEqual("mockFoo");
    });
    it("allows writes to unknown keys", () => {
      const px = proxy as any;
      px.what = "whatwhat";
      expect(px.what).toEqual("whatwhat");
    });
    it("errors on reads of unknown keys", () => {
      const px = proxy as any;
      expect(() => px.what).toThrowErrorMatchingInlineSnapshot(
        `"Could not resolve: \`what\`"`
      );
    });
  });
  describe("getThrownError", () => {
    it("returns the thrown error", () => {
      const mockError = {};
      const mockFn = () => {
        throw mockError;
      };
      expect(getThrownError(mockFn)).toBe(mockError);
    });
    it("throws if the function does not", () => {
      const mockFn = jest.fn();
      expect(() => getThrownError(mockFn)).toThrowErrorMatchingInlineSnapshot(
        `"Expected function to throw an error, but none was thrown."`
      );
    });
  });
});
