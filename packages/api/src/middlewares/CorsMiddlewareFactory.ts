import { Context, Middleware } from "koa";
import { IMiddlewareFactory } from "./IMiddlewareFactory";

export class CorsMiddlewareFactory implements IMiddlewareFactory {
  create(): Middleware {
    return async (ctx: Context, next: () => Promise<any>) => {
      await next();
      ctx.set("Access-Control-Allow-Origin", ctx.get("origin"));
      ctx.set("Access-Control-Allow-Headers", "content-type,authorization");
      ctx.set("Access-Control-Allow-Methods", ctx.response.get("Allow"));
      ctx.set("Vary", "Origin");
    };
  }
}
