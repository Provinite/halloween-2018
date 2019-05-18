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
      "koa",
      asFunction(() => {
        return new Koa();
      }).singleton()
    );
    return container;
  }
}

declare global {
  interface ApplicationContextMembers {
    /** The Koa instance for the application */
    koa: Koa;
  }
}
