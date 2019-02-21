import * as _RandomUtils from "../../RandomUtils";
import { rollWin } from "./DrawEventUtils";
const RandomUtils = _RandomUtils as jest.Mocked<typeof _RandomUtils>;
describe("DrawEventUtils", () => {
  beforeEach(() => {
    jest.spyOn(RandomUtils, "getRandomFloat");
  });
  describe("rollWin", () => {
    // TODO: environmentally configurable
    const odds = 0.5;
    it("returns true if a random float is less than the configured odds", () => {
      RandomUtils.getRandomFloat.mockReturnValue(odds - 0.0001);
      expect(rollWin()).toBe(true);
      RandomUtils.getRandomFloat.mockReturnValue(odds + 0.0001);
      expect(rollWin()).toBe(false);
    });
  });
});
