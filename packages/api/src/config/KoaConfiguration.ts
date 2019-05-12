import { asClass } from "awilix";
import * as BodyParser from "koa-bodyparser";
import { AuthorizationMiddlewareFactory } from "../middlewares/AuthorizationMiddlewareFactory";
import { CorsMiddlewareFactory } from "../middlewares/CorsMiddlewareFactory";
import { ErrorHandlerMiddlewareFactory } from "../middlewares/ErrorHandlerMiddlewareFactory";
import { IMiddlewareFactory } from "../middlewares/IMiddlewareFactory";
import { RenderMiddlewareFactory } from "../middlewares/RenderMiddlewareFactory";
import { RequestContainerMiddlewareFactory } from "../middlewares/RequestContainerMiddlewareFactory";
import { RouterMiddlewareFactory } from "../middlewares/RouterMiddlewareFactory";
import { Component } from "../reflection/Component";
import {
  ApplicationContainer,
  ApplicationContext
} from "./context/ApplicationContext";

@Component()
export class KoaConfiguration {
  /**
   * Configure the webserver with necessary middlewares and start it listening.
   */
  configure({
    routeComponentProcessor,
    container,
    webserver,
    envService
  }: ApplicationContextMembers) {
    const webserverConfig = envService.getWebserverConfig();
    routeComponentProcessor.populateRouteRegistry();
    const configContainer = container.createScope();
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
    webserver.use(BodyParser());
    // the cors middleware relies on other middlewares to set the allow headers
    // so it goes first since it awaits `next()` before setting headers.
    webserver.use(corsMiddleware);
    // the request-scoped container is needed by other middleware so it is added
    // early in the chain. Some other useful request-specific stuff is configured
    // in here too.
    webserver.use(requestContainerMiddleware);
    // the renderer middleware awaits `next()` before setting the response body
    // based on ctx.state.result. So any middleware that come after it in the
    // chain may control the rendered result
    webserver.use(rendererMiddleware);
    // the error handler middleware wraps its call to `next()` in a try/catch
    // so all middlewares from here down can safely throw known error types
    // and expect them to be converted to a reasonable error responseand rendered
    // properly.
    webserver.use(errorHandlerMiddleware);
    // the authorization middleware will throw meaningful exceptions up to the
    // error handler on auth failures. Also populates the current user into
    // the request scoped DI container.
    webserver.use(authorizationMiddleware);
    // finally, if everything went well we actually route the request to a
    // controller.
    webserver.use(routerMiddleware);
    // start the webserver
    webserver.listen(webserverConfig.port);
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
  container: ApplicationContainer,
  factoryClass: new (context: ApplicationContext) => IMiddlewareFactory
) {
  return container.build(asClass(factoryClass)).create();
}

declare global {
  interface ApplicationContextMembers {
    /** Configuration class that starts the webserver listening */
    koaConfiguration: KoaConfiguration;
  }
}
