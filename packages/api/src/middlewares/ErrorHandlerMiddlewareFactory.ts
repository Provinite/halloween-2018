import { Context } from "koa";
import { AuthenticationFailureException } from "../auth/AuthenticationFailureException";
import { AuthenticationTokenExpiredError } from "../auth/AuthenticationTokenExpiredError";
import { PermissionDeniedError } from "../auth/PermissionDeniedError";
import { getMethod, HttpMethod } from "../HttpMethod";
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
      const setErrorResponse = () => {
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
      };
      if (e instanceof AuthenticationFailureException) {
        ctx.status = 400;
        setErrorResponse();
      } else if (e instanceof UnknownMethodError) {
        ctx.status = 501;
        setErrorResponse();
      } else if (
        e instanceof PermissionDeniedError ||
        e instanceof UnknownRouteError ||
        e instanceof ResourceNotFoundError
      ) {
        errorName = "ResourceNotFoundError";
        ctx.status = 404;
        setErrorResponse();
      } else if (e instanceof AuthenticationTokenExpiredError) {
        ctx.status = 401;
        setErrorResponse();
      } else if (e instanceof MethodNotSupportedError) {
        /* Method not supported errors must present an ALLOW header. */
        // TODO: This is leaking info :(
        const method = getMethod(ctx.method);
        if (method === HttpMethod.OPTIONS) {
          ctx.status = 200;
        } else {
          ctx.status = 405;
          setErrorResponse();
        }
        ctx.set("Allow", e.allow.join(", "));
      } else {
        ctx.status = 500;
        setErrorResponse();
      }
    }
  };
}
