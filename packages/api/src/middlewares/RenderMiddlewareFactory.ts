import { Context, Middleware } from "koa";
import { IMiddlewareFactory } from "./IMiddlewareFactory";
import { INextCallback } from "./INextCallback";

export class RenderMiddlewareFactory implements IMiddlewareFactory {
  create(): Middleware {
    /* These middlewares will be delegated-to based on type */
    const renderString: Middleware = async (
      ctx: Context,
      next: INextCallback
    ) => {
      ctx.body = ctx.state.result;
      await next();
    };

    const renderObject: Middleware = async (
      ctx: Context,
      next: INextCallback
    ) => {
      ctx.body = JSON.stringify(ctx.state.result);
      ctx.response.set("content-type", "application/json");
      await next();
    };

    /* This middleware will intelligently delegate to those above */
    const smartRender: Middleware = async (
      ctx: Context,
      next: INextCallback
    ) => {
      if (typeof ctx.state.result === "string") {
        return renderString(ctx, next);
      } else {
        return renderObject(ctx, next);
      }
    };
    return smartRender;
  }
}
