import * as Koa from "koa";
import { RenderMiddlewareFactory } from "../middlewares/RenderMiddlewareFactory";
import { RouterMiddlewareFactory } from "../middlewares/RouterMiddlewareFactory";
import { Component } from "../reflection/Component";
import { RouteComponentProcessor } from "./RouteComponentProcessor";

@Component()
export class KoaConfiguration {
  private webserver: Koa;
  private routeComponentProcessor: RouteComponentProcessor;
  constructor(
    routeComponentProcessor: RouteComponentProcessor,
    webserver: Koa
  ) {
    this.routeComponentProcessor = routeComponentProcessor;
    this.webserver = webserver;
  }
  configure() {
    const handlers = this.routeComponentProcessor.getRouteHandlerMap();
    const routerMiddleware = new RouterMiddlewareFactory(handlers).create();
    const rendererMiddleware = new RenderMiddlewareFactory().create();
    this.webserver.use(routerMiddleware);
    this.webserver.use(rendererMiddleware);
    this.webserver.listen(process.env.PORT || 8080);
  }
}
