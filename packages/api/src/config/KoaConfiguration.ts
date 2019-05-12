import { asClass, AwilixContainer } from "awilix";
import * as Koa from "koa";
import * as BodyParser from "koa-bodyparser";
import { AuthorizationMiddlewareFactory } from "../middlewares/AuthorizationMiddlewareFactory";
import { CorsMiddlewareFactory } from "../middlewares/CorsMiddlewareFactory";
import { ErrorHandlerMiddlewareFactory } from "../middlewares/ErrorHandlerMiddlewareFactory";
import { IMiddlewareFactory } from "../middlewares/IMiddlewareFactory";
import { RenderMiddlewareFactory } from "../middlewares/RenderMiddlewareFactory";
import { RequestContainerMiddlewareFactory } from "../middlewares/RequestContainerMiddlewareFactory";
import { RouterMiddlewareFactory } from "../middlewares/RouterMiddlewareFactory";
import { Component } from "../reflection/Component";
import { EnvService } from "./env/EnvService";
import { IWebserverConfiguration } from "./env/IWebserverConfiguration";
import { RouteComponentProcessor } from "./RouteComponentProcessor";

@Component()
export class KoaConfiguration {
  private webserverConfig: IWebserverConfiguration;
  constructor(
    private container: AwilixContainer,
    private routeComponentProcessor: RouteComponentProcessor,
    private webserver: Koa,
    envService: EnvService
  ) {
    this.webserverConfig = envService.getWebserverConfig();
  }
  /**
   * Configure the webserver with necessary middlewares and start it listening.
   */
  configure() {
    this.routeComponentProcessor.populateRouteRegistry();
    const configContainer = this.container.createScope();
    // middleware for triggering controllers' @Route handlers
    const routerMiddleware = createMiddleware(
      configContainer,
      RouterMiddlewareFactory
    );
    // middleware for rendering objects
    const rendererMiddleware = createMiddleware(
      configContainer,
      RenderMiddlewareFactory
    );
    // middleware for configuring CORS headers
    const corsMiddleware = createMiddleware(
      configContainer,
      CorsMiddlewareFactory
    );
    // middleware for route-based authorization
    const authorizationMiddleware = createMiddleware(
      configContainer,
      AuthorizationMiddlewareFactory
    );
    // middleware for creating a request-scoped DI container
    const requestContainerMiddleware = createMiddleware(
      configContainer,
      RequestContainerMiddlewareFactory
    );
    // middleware for top-level error handling
    const errorHandlerMiddleware = createMiddleware(
      configContainer,
      ErrorHandlerMiddlewareFactory
    );

    // middleware for parsing request bodies into objects
    this.webserver.use(BodyParser());
    // the cors middleware relies on other middlewares to set the allow headers
    // so it goes first since it awaits `next()` before setting headers.
    this.webserver.use(corsMiddleware);
    // the request-scoped container is needed by other middleware so it is added
    // early in the chain. Some other useful request-specific stuff is configured
    // in here too.
    this.webserver.use(requestContainerMiddleware);
    // the renderer middleware awaits `next()` before setting the response body
    // based on ctx.state.result. So any middleware that come after it in the
    // chain may control the rendered result
    this.webserver.use(rendererMiddleware);
    // the error handler middleware wraps its call to `next()` in a try/catch
    // so all middlewares from here down can safely throw known error types
    // and expect them to be converted to a reasonable error responseand rendered
    // properly.
    this.webserver.use(errorHandlerMiddleware);
    // the authorization middleware will throw meaningful exceptions up to the
    // error handler on auth failures. Also populates the current user into
    // the request scoped DI container.
    this.webserver.use(authorizationMiddleware);
    // finally, if everything went well we actually route the request to a
    // controller.
    this.webserver.use(routerMiddleware);
    // start the webserver
    this.webserver.listen(this.webserverConfig.port);
  }
}

/**
 * Use the provided DI container and middleware factory class to create
 * a middleware.
 * @param container - The Awilix container to use to build the middleware
 *    factory.
 * @param factoryClass - The class to instantiate.
 */
function createMiddleware(
  container: AwilixContainer,
  factoryClass: new (...args: any[]) => IMiddlewareFactory
) {
  return container.build(asClass(factoryClass)).create();
}

declare global {
  interface ApplicationContext {
    koaConfiguration: KoaConfiguration;
  }
}
