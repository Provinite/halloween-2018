import { asFunction, AwilixContainer } from "awilix";
import * as Koa from "Koa";
export class WebserverContext {
  /**
   * @static @method configureContainer
   * Provide a webserver to the DI container.
   * @param container - The DI container
   */
  static configureContainer(container: AwilixContainer) {
    container.register(
      "webserver",
      asFunction(() => {
        const webserver: Koa = new Koa();
        webserver.listen(process.env.PORT || 8080);
        return webserver;
      })
    );
    return container;
  }
}
