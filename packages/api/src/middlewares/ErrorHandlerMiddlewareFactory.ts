import { Context } from "koa";
import { QueryFailedError } from "typeorm";
import { AuthenticationFailureException } from "../auth/AuthenticationFailureException";
import { AuthenticationTokenExpiredError } from "../auth/AuthenticationTokenExpiredError";
import { PermissionDeniedError } from "../auth/PermissionDeniedError";
import { isDuplicateKeyError } from "../db/OrmErrors";
import { getMethod, HttpMethod } from "../HttpMethod";
import { logger } from "../logging";
import { DrawRateLimitExceededError } from "../models/DrawEvent/DrawRateLimitExceededError";
import { BadRequestError } from "../web/BadRequestError";
import { MethodNotSupportedError } from "../web/MethodNotSupportedError";
import { RequestValidationError } from "../web/RequestValidationUtils";
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
      const errorName = e instanceof Error ? e.constructor.name : "";
      /** The response body object for the error response. */
      const errorResult: { error: string; [key: string]: any } = {
        error: errorName
      };
      const setErrorResponse = () => {
        ctx.state.result = {
          ...errorResult,
          status: ctx.status
        };
        // TODO: logger.error for other unknown errors
        logger.info(
          "ErrorHandler: Caught error - " +
            (e instanceof Object ? e.constructor.name : "UnknownError")
        );
        logger.info(`[${ctx.method}]: ${ctx.path}`);
        logger.info("message: " + e.message);
        logger.info(e.stack);
      };
      if (e instanceof AuthenticationFailureException) {
        ctx.status = 400;
        setErrorResponse();
      } else if (e instanceof UnknownMethodError) {
        ctx.status = 501;
        setErrorResponse();
      } else if (e instanceof BadRequestError) {
        // generic bad request error
        ctx.status = 400;
        errorResult.message = e.message;
        setErrorResponse();
      } else if (
        e instanceof PermissionDeniedError ||
        e instanceof UnknownRouteError ||
        e instanceof ResourceNotFoundError
      ) {
        errorResult.error = "ResourceNotFoundError";
        ctx.status = 404;
        setErrorResponse();
      } else if (e instanceof AuthenticationTokenExpiredError) {
        // User's auth token expired.
        ctx.status = 401;
        setErrorResponse();
      } else if (e instanceof DrawRateLimitExceededError) {
        // Too many draws, attach try again at date to response.
        ctx.status = 401;
        errorResult.tryAgainAt = e.tryAgainAt;
        setErrorResponse();
      } else if (e instanceof RequestValidationError) {
        // Request validation failed, attach validation error results
        // to the response.
        ctx.status = 400;
        errorResult.errrors = e.erroredResults;
        setErrorResponse();
      } else if (e instanceof QueryFailedError && isDuplicateKeyError(e)) {
        // Duplicate key error, attempt to extract the key and make the message
        // more useful.
        const knownDetailPattern = /Key \((.*?)\)=\(.*?\) already exists/i;
        const match = knownDetailPattern.exec(e.detail);
        errorResult.error = "DuplicateKeyError";
        if (match === null) {
          errorResult.message = e.detail || "Unacceptable duplicate value.";
        } else {
          errorResult.message = `Duplicate value for "${match[1]}".`;
          errorResult.column = match[1];
        }
        ctx.status = 400;
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
