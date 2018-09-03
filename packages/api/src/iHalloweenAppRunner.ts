import * as Koa from "koa";
export interface IHalloweenAppRunner {
  run(webserver: Koa): void;
}
