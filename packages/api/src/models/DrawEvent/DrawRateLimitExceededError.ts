export class DrawRateLimitExceededError extends Error {
  constructor(public tryAgainAt: Date) {
    super("You may draw again at " + tryAgainAt.toISOString());
  }
}
