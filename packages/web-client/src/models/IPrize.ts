/**
 * A model representing a prototypal prize.
 * Includes quantity and odds configuration.
 */
export interface IPrize {
  /** A unique identifier  */
  id: number;
  /** The name of the prize. */
  name: string;
  /** A description for this prize. */
  description: string;
  /** The initial total number of prizes of this type in the pool. */
  initialStock: number;
  /** The remaining number of this prize in the pool. */
  currentStock: number;
  /** The weight of this prize in the pool. */
  weight: number;
  /** The ID of the parent game. */
  gameId: number;
}
