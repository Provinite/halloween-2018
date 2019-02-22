import * as _MathUtils from "./MathUtils";
import { getRandomFloat, selectRandomItemFromPool } from "./RandomUtils";
import * as _RandomUtils from "./RandomUtils";
const rand = require("math-random") as jest.Mock<() => number>;

jest.mock("math-random");

const RandomUtils: jest.Mocked<typeof _RandomUtils> = _RandomUtils as any;
const MathUtils: jest.Mocked<typeof _MathUtils> = _MathUtils as any;
describe("RandomUtils", () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });
  describe("getRandomFloat", () => {
    it("proxies math-random()", () => {
      const mockResult = { secret: "sauce" };
      rand.mockReturnValue(mockResult);
      expect(getRandomFloat()).toBe(mockResult);
      expect(rand).toHaveBeenCalledTimes(1);
    });
  });
  describe("selectRandomItemFromPool", () => {
    beforeEach(() => {
      jest.spyOn(RandomUtils, "getRandomInt");
      jest.spyOn(MathUtils, "getOrderedPartialSums");
    });
    it("uses the provided reducer to generate partial sums", () => {
      const pool = [{ id: 1 }, { id: 2 }];
      const reducer = jest.fn();
      selectRandomItemFromPool(pool, reducer);
      expect(MathUtils.getOrderedPartialSums.mock.calls[0][1]).toBe(reducer);
    });
    const poolSpec = (randResult: number, expectedSelection: number) => {
      it(`selection test: (${randResult}, ${expectedSelection})`, () => {
        MathUtils.getOrderedPartialSums.mockReturnValue([5, 10]);
        RandomUtils.getRandomInt.mockReturnValue(randResult);
        const pool = [{ id: "id-1" }, { id: "id-2" }];
        const result = selectRandomItemFromPool(pool, jest.fn());
        expect(result).toBe(pool[expectedSelection]);
      });
    };
    poolSpec(0, 0);
    poolSpec(1, 0);
    poolSpec(2, 0);
    poolSpec(3, 0);
    poolSpec(4, 0);
    poolSpec(5, 1);
    poolSpec(6, 1);
    poolSpec(7, 1);
    poolSpec(8, 1);
    poolSpec(9, 1);
  });
});
