import { asClass, createContainer, InjectionMode } from "awilix";
import * as Koa from "koa";
import { ComponentRegistrar } from "./config/ComponentRegistrar";
import { OrmContext } from "./database/OrmContext";
import { AnyFunction } from "./decorators/AnyFunction";
import { ExportPathScanner } from "./decorators/ExportPathScanner";
import { IScannableClass } from "./decorators/ScannableClass";
import { isRoutable, routableMethods, targetRoute } from "./decorators/Symbols";
import { IHalloweenAppRunner } from "./IHalloweenAppRunner";
import { LoggingMiddlewareFactory } from "./middlewares/LoggingMiddlewareFactory";
import { RenderMiddlewareFactory } from "./middlewares/RenderMiddlewareFactory";
import { RouterMiddlewareFactory } from "./middlewares/RouterMiddlewareFactory";

export class HalloweenAppDevRunner implements IHalloweenAppRunner {
  private webserver: Koa;

  constructor(webserver: Koa) {
    this.webserver = webserver;
  }

  async run(): Promise<void> {
    // Proof of concept: classpath scanning
    const components = await ExportPathScanner.scan("./dist/**/*.js");
    // Container configuration step

    // Proof of concept: automatic bean instantiation
    const container = createContainer({
      injectionMode: InjectionMode.CLASSIC
    });

    // Wire up our persistence layer
    await OrmContext.configureContainer(container);

    // Register all @components with our DI container
    ComponentRegistrar.configureContainer(container, components);

    // Proof of concept: @Route methods
    const handlers: { [key: string]: AnyFunction } = {};
    Object.keys(container.registrations)
      .map(beanName => container.cradle[beanName])
      .forEach(bean => {
        (bean[routableMethods] as any[])
          .filter(method => method[isRoutable] === true)
          .forEach(method => (handlers[method[targetRoute]] = method));
      });

    // Proof of concept: Middleware factories/layers
    const factories = {
      logging: new LoggingMiddlewareFactory(console),
      rendering: new RenderMiddlewareFactory(),
      routing: new RouterMiddlewareFactory(handlers)
    };

    this.webserver.use(factories.routing.create());
    this.webserver.use(factories.rendering.create());
    this.webserver.listen(process.env.PORT);
  }
}
