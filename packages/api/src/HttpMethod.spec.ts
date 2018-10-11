import { getMethod, HttpMethod } from "./HttpMethod";

describe("util:HttpMethod", () => {
  describe("function:getMethod", () => {
    [
      ["GET", HttpMethod.GET],
      ["PATCH", HttpMethod.PATCH],
      ["FOOBAR", undefined]
    ].forEach(([str, httpMethod]) => {
      it("maps", () => {
        expect(getMethod(str)).toBe(httpMethod);
      });
    });
  });
});
