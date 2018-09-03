import * as Koa from "koa";
import { IHalloweenAppRunner } from "./IHalloweenAppRunner";

export class HalloweenAppDevRunner implements IHalloweenAppRunner {
  private webserver: Koa;
  constructor(webserver: Koa) {
    this.webserver = webserver;
  }
  run(): void {
    console.log("Initializing and launching the application");

    this.webserver.use(ctx => {
      ctx.body = "Hello from HalloweenAppDevRunner";
    });
    this.webserver.listen(8081);
  }
}
