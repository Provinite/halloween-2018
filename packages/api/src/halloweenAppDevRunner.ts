import * as Koa from "koa";
import { IHalloweenAppRunner } from "./IHalloweenAppRunner";

export class HalloweenAppDevRunner implements IHalloweenAppRunner {
  private webserver: Koa;
  run(): void {
    this.webserver = new Koa();
    console.log("Initializing and launching the application");

    this.webserver.use(ctx => {
      ctx.body = "Hello from HalloweenAppDevRunner";
    });
    this.webserver.listen(8081);
  }
}
