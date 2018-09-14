import { asClass, createContainer, InjectionMode } from "awilix";
import * as Koa from "koa";
import { AnyFunction } from "./decorators/AnyFunction";
import { Constructor } from "./decorators/Constructor";
import { ExportPathScanner } from "./decorators/ExportPathScanner";
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

    // Proof of concept: automatic bean instantiation
    const container = createContainer({
      injectionMode: InjectionMode.CLASSIC
    });

    components.forEach((componentClass: Constructor) => {
      let name = componentClass.name;
      name = name[0].toLowerCase() + name.substr(1);
      // We register our beans here
      // At some point we need to run through the beans and look for controllers
      // and shit
      container.register(name, asClass(componentClass));
    });
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
