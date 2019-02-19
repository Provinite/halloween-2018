/**
 * Sum the provided data and return an array of the running total at each step.
 * @param summands - The numbers to sum.
 * @return An array of numbers where result[i] is the total after adding
 * summands[i]
 */
export function getOrderedPartialSums(summands: number[]): number[];
export function getOrderedPartialSums<InputType>(
  data: InputType[],
  getSummand: (datum: InputType) => number
): number[];
/**
 * Sum the results of applying the provided `getSummand` reducer to data, and
 * return an array of the running total at each step.
 * @param data - The data to reduce and sum.
 * @param getSummand - A reducer function which will be invoked once for each
 *  element of `data`. It should return a number.
 * @return An array of numbers where result[i] is the total after adding
 *  `getSummand(data[i])`
 */
export function getOrderedPartialSums<InputType>(
  data: InputType[],
  getSummand?: (datum: InputType) => number
): number[] {
  if (data.length === 0) {
    return [];
  }
  const isNumbers = typeof data[0] === "number";
  if (!isNumbers && !getSummand) {
    throw new Error(
      "MathUtils#getOrderedPartialSums: Need summand function for non-number inputs."
    );
  }
  const totals: number[] = [];
  let total: number = 0;
  for (const datum of data) {
    if (getSummand) {
      total += getSummand(datum);
    } else {
      total += datum as any;
    }
    totals.push(total);
  }
  return totals;
}
