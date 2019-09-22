import { getTestAppContext } from "./testHelpers";
import { Game } from "../../models";

const ONE_WEEK_IN_MILLISECONDS = 14 * 24 * 60 * 60 * 1000;

/**
 * Create a test game
 */
export const createTestGame = async <T extends Partial<Game>>(options?: T) => {
  const { gameRepository } = getTestAppContext();
  const defaultGameOptions: Partial<Game> = {
    contact: "mockContact@example.com",
    description: "A test game",
    name: "Test Game",
    startDate: new Date(Date.now()),
    endDate: new Date(Date.now() + ONE_WEEK_IN_MILLISECONDS)
  };
  try {
    return await gameRepository.save(
      gameRepository.create({
        ...defaultGameOptions,
        ...options
      })
    );
  } catch (e) {
    throw new Error(e.message);
  }
};
