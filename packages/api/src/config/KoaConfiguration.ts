import { asClass, asValue, AwilixContainer } from "awilix";
import * as Koa from "koa";
import { Connection } from "typeorm";
import { RestRepository } from "../controllers/RestRepository";
import { RenderMiddlewareFactory } from "../middlewares/RenderMiddlewareFactory";
import { RouterMiddlewareFactory } from "../middlewares/RouterMiddlewareFactory";
import { User } from "../models";
import { Component } from "../reflection/Component";
import { Controller } from "../reflection/Controller";
import { EnvService, IWebserverConfiguration } from "./EnvService";
import { RouteComponentProcessor } from "./RouteComponentProcessor";

@Component()
export class KoaConfiguration {
  private container: AwilixContainer;
  private webserver: Koa;
  private webserverConfig: IWebserverConfiguration;
  private routeComponentProcessor: RouteComponentProcessor;
  constructor(
    container: AwilixContainer,
    routeComponentProcessor: RouteComponentProcessor,
    webserver: Koa,
    envService: EnvService
  ) {
    this.container = container;
    this.routeComponentProcessor = routeComponentProcessor;
    this.webserver = webserver;
    this.webserverConfig = envService.getWebserverConfig();
  }
  /**
   * Configure the webserver with necessary middlewares and start it listening.
   */
  configure() {
    const handlers = this.routeComponentProcessor.getRouteHandlerMap();
    const configContainer = this.container.createScope();
    configContainer.register("handlers", asValue(handlers));
    const routerMiddleware = configContainer
      .build(asClass(RouterMiddlewareFactory))
      .create();
    const rendererMiddleware = new RenderMiddlewareFactory().create();
    this.webserver.use(routerMiddleware);
    this.webserver.use(rendererMiddleware);
    this.webserver.listen(this.webserverConfig.port);
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
