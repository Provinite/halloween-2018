import { Prize } from "../../models";
import { getTestAppContext } from "./testHelpers";

export const createTestPrize = (prize: Partial<Prize>) => {
  const { prizeRepository } = getTestAppContext();
  return prizeRepository.save(
    prizeRepository.create({
      currentStock: 100,
      initialStock: 100,
      description: "A test prize.",
      name: "Test Prize",
      ...prize
    })
  );
};
