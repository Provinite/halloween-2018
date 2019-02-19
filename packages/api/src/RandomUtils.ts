import { getOrderedPartialSums } from "./MathUtils";

const rand = require("math-random");

const thisModule = {
  getRandomInt,
  getRandomFloat,
  selectRandomItemFromPool
};

/**
 * Get a random int in the range [min, max)
 * @param min - The minimum value (inclusive)
 * @param max - The maximum value (exclusive)
 * @return A random int in [min, max)
 */
export function getRandomInt(min: number, max: number): number {
  return Math.floor(rand() * (max - min)) + min;
}

/**
 * Get a random float in the range [0, 1)
 */
export function getRandomFloat() {
  return rand();
}

export function selectRandomItemFromPool<T>(
  pool: T[],
  getQuantity: (item: T) => number
) {
  if (!pool || !getQuantity) {
    throw new Error(
      "RandomUtils#selectRandomItemFromPool - pool and getQuantity are required."
    );
  }
  if (!pool.length) {
    throw new Error(
      "RandomUtils#selectRandomItemFromPool - Cannot select from empty pool."
    );
  }

  const boundaries: number[] = getOrderedPartialSums(pool, getQuantity);
  const total = boundaries[boundaries.length - 1];
  const selection = thisModule.getRandomInt(0, total);
  const selectedIndex = boundaries.findIndex(b => b > selection);
  return pool[selectedIndex];
}

module.exports = thisModule;
