import { Context, Middleware } from "koa";
import { IMiddlewareFactory } from "./IMiddlewareFactory";
import { INextCallback } from "./INextCallback";
export interface IRouteMap {
  [route: string]: Function;
}
export class RouterMiddlewareFactory implements IMiddlewareFactory {
  private handlers: IRouteMap;
  constructor(handlers: IRouteMap) {
    this.handlers = handlers;
  }
  create(): Middleware {
    return async (ctx: Context, next: INextCallback) => {
      const path: string = ctx.path;
      if (this.handlers[path]) {
        ctx.state.result = await this.handlers[path](ctx);
      }
      await next();
    };
  }
}
