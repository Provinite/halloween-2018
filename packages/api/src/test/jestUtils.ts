/**
 * Create an asymmetric matcher. Can be used anywhere that `.toEqual` is used.
 * Uses the provided matcher function instead of default `.toEqual` deep equality
 * behavior.
 */
export function asymmetricMatcher(fn: (actual: any) => boolean) {
  return {
    asymmetricMatch: fn
  };
}

/** Asymmetric matcher, matches `val` using `===` logic */
export function exactly(val: any) {
  return asymmetricMatcher(actual => actual === val);
}
