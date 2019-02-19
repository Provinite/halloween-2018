import { makeGetterObject } from "../../../test/testUtils";
import { Prize } from "../../Prize";

export const mockPrizes = makeGetterObject({
  fullStock: () => {
    const mockPrize = new Prize();
    mockPrize.currentStock = 100;
    mockPrize.initialStock = 100;
    mockPrize.weight = 0.5;
    mockPrize.id = 1;
    mockPrize.name = "Mock Prize";
    return mockPrize;
  }
});
