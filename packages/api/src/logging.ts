import * as winston from "winston";
export const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  ),
  transports: [new winston.transports.Console()]
});
if (process.env.JEST_WORKER_ID !== undefined) {
  logger.level = "error";
}
