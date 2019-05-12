import { makeGetterObject } from "../../../test/testUtils";
import { Game } from "../../Game";
export const mockGames = makeGetterObject({
  sample: () => {
    const game = new Game();
    game.winRate = 0.5;
    game.name = "Mock Game";
    game.id = 148;
    game.description = "A mock game description";
    game.contact = "contact@mockgames.com";
    game.drawResetSchedule = "0 12 * * *";
    game.vipDrawsPerReset = 2;
    game.drawsPerReset = 1;
    game.startDate = new Date("2019-03-01 00:00:00");
    game.endDate = new Date("2019-03-08 00:00:00");
    return game;
  }
});
