import { asValue, AwilixContainer } from "awilix";
import * as Koa from "Koa";
export class WebserverContext {
  /**
   * @static @method configureContainer
   * Provide a webserver to the DI container.
   * @param container - The DI container
   */
  static configureContainer(container: AwilixContainer) {
    const webserver: Koa = new Koa();
    webserver.listen(process.env.PORT || 8080);
    container.register("webserver", asValue(webserver));
    return container;
  }
}
