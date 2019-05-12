import { getRandomFloat } from "../../RandomUtils";
import { Game } from "../Game";

/**
 * Used to determine winningness for a draw. Returns a random boolean, weighted
 * using the application's configured winrate.
 */
export function rollWin(game: Game) {
  return game.winRate > getRandomFloat();
}
