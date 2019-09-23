/** Model representing a game. */
export interface IGame {
  /** The unique ID for the game. */
  id: number;
  /** The name of the game. */
  name: string;
  /** A description for the game. */
  description: string;
  /** Contact information for the game owner. */
  contact: string;
  /** Main splash image URL */
  mainImageUrl: string;
  /** Start date for the game */
  startDate: string | null;
  /** End date for the game */
  endDate: string | null;
  /** Crontab style schedule indicating when the game resets. */
  drawResetSchedule: string;
  /** The number of draws a normal user gets per reset. */
  drawsPerReset: number;
  /** The number of draws a VIP user gets per reset. */
  vipDrawsPerReset: number;
  /** The win rate for this game. */
  winRate: number;
}
