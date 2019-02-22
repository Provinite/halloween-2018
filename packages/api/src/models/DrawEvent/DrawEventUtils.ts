import { getRandomFloat } from "../../RandomUtils";

// TODO: environmentally configurable
const winRate = 0.5;
/**
 * Used to determine winningness for a draw. Returns a random boolean, weighted
 * using the application's configured winrate.
 */
export function rollWin() {
  return winRate > getRandomFloat();
}
