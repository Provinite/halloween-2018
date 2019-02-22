export class DrawRateLimitExceededError extends Error {
  // 30 seconds
  constructor(public tryAgainAt: Date) {
    super("You may only draw once every 30 seconds.");
  }
}
