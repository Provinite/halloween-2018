import { Middleware } from "koa";

export interface IMiddlewareFactory {
  create(): Middleware;
}
