import { Context, Middleware } from "koa";
import { IMiddlewareFactory } from "./IMiddlewareFactory";
import { INextCallback } from "./INextCallback";

export class RouterMiddlewareFactory implements IMiddlewareFactory {
  private handlers: any;
  constructor(handlers: any) {
    this.handlers = handlers;
  }
  create(): Middleware {
    return async (ctx: Context, next: INextCallback) => {
      const path: string = ctx.path;
      if (this.handlers[path]) {
        ctx.state.result = await Promise.resolve(this.handlers[path](ctx));
      }
      await next();
    };
  }
}
