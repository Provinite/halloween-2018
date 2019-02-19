import { getOrderedPartialSums } from "./MathUtils";

describe("MathUtils", () => {
  describe("getOrderedPartialSums", () => {
    it("sums an array of numbers", () => {
      const values = [1, 2, 3, 4, 5];
      const expectedSums = [1, 3, 6, 10, 15];
      expect(getOrderedPartialSums(values)).toEqual(expectedSums);
    });
    it("sums an array of objects with a reducer function", () => {
      const values = [{ value: 1 }, { value: 2 }, { value: 3 }, { value: 4 }];
      const expectedSums = [1, 3, 6, 10];
      expect(getOrderedPartialSums(values, v => v.value)).toEqual(expectedSums);
    });
    it("throws if an array of objects is used without a reducer", () => {
      const values = [{ value: 1 }];
      expect(() => getOrderedPartialSums(values, undefined)).toThrowError();
    });
  });
});
