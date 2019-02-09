import { Context, Middleware } from "koa";
import { IMiddlewareFactory } from "./IMiddlewareFactory";
import { INextCallback } from "./INextCallback";

/**
 * Middleware that renders responses from ctx.state.result. Note that this
 * middleware is intended to be placed before the middlewares that populate
 * ctx.state.result, as it defers rendering until after next() has resolved.
 */
export class RenderMiddlewareFactory implements IMiddlewareFactory {
  create(): Middleware {
    /* These middlewares will be delegated-to based on type */
    const renderString: Middleware = async (
      ctx: Context,
      next: INextCallback
    ) => {
      await next();
      ctx.body = ctx.state.result;
    };

    const renderObject: Middleware = async (
      ctx: Context,
      next: INextCallback
    ) => {
      await next();
      ctx.body = JSON.stringify(ctx.state.result);
      ctx.response.set("content-type", "application/json");
    };

    /* This middleware will intelligently delegate to those above */
    const smartRender: Middleware = async (
      ctx: Context,
      next: INextCallback
    ) => {
      if (typeof ctx.state.result === "string") {
        return await renderString(ctx, next);
      } else {
        return await renderObject(ctx, next);
      }
    };
    return smartRender;
  }
}
