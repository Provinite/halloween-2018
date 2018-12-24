import { Context } from "koa";
import { AuthenticationFailureException } from "../auth/AuthenticationFailureException";
import { AuthenticationTokenExpiredError } from "../auth/AuthenticationTokenExpiredError";
import { PermissionDeniedError } from "../auth/PermissionDeniedError";
import { logger } from "../logging";
import { MethodNotSupportedError } from "../web/MethodNotSupportedError";
import { ResourceNotFoundError } from "../web/ResourceNotFoundError";
import { UnknownMethodError } from "../web/UnknownMethodError";
import { UnknownRouteError } from "../web/UnknownRouteError";
import { IMiddlewareFactory } from "./IMiddlewareFactory";
import { INextCallback } from "./INextCallback";

export class ErrorHandlerMiddlewareFactory implements IMiddlewareFactory {
  create = () => async (ctx: Context, next: INextCallback) => {
    try {
      await next();
    } catch (e) {
      let errorName = e instanceof Error ? e.constructor.name : "";
      if (e instanceof AuthenticationFailureException) {
        ctx.status = 400;
      } else if (e instanceof UnknownMethodError) {
        ctx.status = 501;
      } else if (
        e instanceof PermissionDeniedError ||
        e instanceof UnknownRouteError ||
        e instanceof ResourceNotFoundError
      ) {
        errorName = "ResourceNotFoundError";
        ctx.status = 404;
      } else if (e instanceof AuthenticationTokenExpiredError) {
        ctx.status = 401;
      } else if (e instanceof MethodNotSupportedError) {
        ctx.status = 405;
      } else {
        ctx.status = 500;
      }
      ctx.state.result = {
        error: errorName,
        status: ctx.status
      };
      logger.error(
        "ErrorHandler: Caught error - " +
          (e instanceof Object ? e.constructor.name : "UnknownError")
      );
      logger.error(`[${ctx.method}]: ${ctx.path}`);
      logger.error("message: " + e.message);
      logger.error(e.stack);
    }
  };
}