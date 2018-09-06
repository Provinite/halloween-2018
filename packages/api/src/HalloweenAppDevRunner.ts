import * as Koa from "koa";
import { IHalloweenAppRunner } from "./IHalloweenAppRunner";

export class HalloweenAppDevRunner implements IHalloweenAppRunner {
  private webserver: Koa;
  constructor(webserver: Koa) {
    this.webserver = webserver;
  }
  run(): void {
    this.webserver.use(ctx => {
      ctx.body = "Hessszl  lsssso from HazlloweenAppDevRunner";
    });
    this.webserver.listen(process.env.PORT);
  }
}
