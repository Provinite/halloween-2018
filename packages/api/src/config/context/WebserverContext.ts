import { asFunction } from "awilix";
import * as Koa from "koa";
export class WebserverContext {
  /**
   * @static @method configureContainer
   * Provide a webserver to the DI container.
   * @param container - The DI container
   * @inject
   */
  static configureContainer({ container }: ApplicationContextMembers) {
    container.register(
      "koaInstance",
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
    koaInstance: Koa;
  }
}
