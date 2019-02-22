import { makeGetterObject } from "./testUtils";

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
});
