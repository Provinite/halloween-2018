import * as _RandomUtils from "../../RandomUtils";
import { mockGames } from "../game/mocks/mockGames";
import { rollWin } from "./DrawEventUtils";
const RandomUtils = _RandomUtils as jest.Mocked<typeof _RandomUtils>;
describe("DrawEventUtils", () => {
  beforeEach(() => {
    jest.spyOn(RandomUtils, "getRandomFloat");
  });
  describe("rollWin", () => {
    it("returns true if a random float is less than the configured odds", () => {
      const odds = mockGames.sample.winRate;
      RandomUtils.getRandomFloat.mockReturnValue(odds - 0.0001);
      expect(rollWin(mockGames.sample)).toBe(true);
      RandomUtils.getRandomFloat.mockReturnValue(odds + 0.0001);
      expect(rollWin(mockGames.sample)).toBe(false);
    });
  });
});
