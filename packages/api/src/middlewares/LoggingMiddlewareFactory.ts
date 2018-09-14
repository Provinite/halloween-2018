import { Middleware } from "koa";
import { IMiddlewareFactory } from "./IMiddlewareFactory";

interface ILogger {
  log: (...args: any[]) => any;
}

export class LoggingMiddlewareFactory implements IMiddlewareFactory {
  logger: ILogger;
  constructor(logger: ILogger) {
    this.logger = logger;
  }
  create() {
    return this._create(this.logger);
  }

  private _create(logger: ILogger) {
    const middleware: Middleware = async (ctx, next) => {
      logger.log(ctx);
      await next();
    };
    return middleware;
  }
}
