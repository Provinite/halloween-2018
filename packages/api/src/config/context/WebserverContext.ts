import { asFunction, AwilixContainer } from "awilix";
import * as Koa from "koa";
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
        return webserver;
      }).singleton()
    );
    return container;
  }
}

declare global {
  interface ApplicationContextMembers {
    /** The Koa instance for the application */
    webserver: Koa;
  }
}
