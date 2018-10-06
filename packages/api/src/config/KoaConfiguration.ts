import * as Koa from "koa";
import { Connection } from "typeorm";
import { RestRepository } from "../controllers/RestRepository";
import { RenderMiddlewareFactory } from "../middlewares/RenderMiddlewareFactory";
import { RouterMiddlewareFactory } from "../middlewares/RouterMiddlewareFactory";
import { User } from "../models";
import { Component } from "../reflection/Component";
import { Route } from "../reflection/Route";
import { RouteComponentProcessor } from "./RouteComponentProcessor";
import { Controller } from "../reflection/Controller";

@Component()
export class KoaConfiguration {
  private webserver: Koa;
  private routeComponentProcessor: RouteComponentProcessor;
  private orm: Connection;
  constructor(
    routeComponentProcessor: RouteComponentProcessor,
    webserver: Koa,
    orm: Connection
  ) {
    this.routeComponentProcessor = routeComponentProcessor;
    this.webserver = webserver;
    this.orm = orm;
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
/* tslint:disable:max-classes-per-file */
@Controller()
export class Foo extends RestRepository<User> {
  constructor(orm: Connection) {
    super(orm, User);
  }
  getSome(): string {
    return "some";
  }
}
