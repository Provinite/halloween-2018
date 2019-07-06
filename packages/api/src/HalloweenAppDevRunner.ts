import { asClass, asValue } from "awilix";
import { createApplicationContainer } from "./AwilixHelpers";
import {
  ApplicationContext,
  ContextContainer
} from "./config/context/ApplicationContext";
import { ComponentRegistrar } from "./config/context/ComponentRegistrar";
import { OrmContext } from "./config/context/OrmContext";
import { WebserverContext } from "./config/context/WebserverContext";
import { ENV_VARS } from "./config/env/ENV_VARS";
import { EnvService } from "./config/env/EnvService";
import { ExportPathScanner } from "./reflection/ExportPathScanner";

export class HalloweenAppDevRunner {
  /**
   * Run the application.
   * @param [applicationOptions] Options for this application instance
   * @param [applicationOptions.envOverrides={}] A map of environment keys that
   *  will take precedence over process.env.
   * @param [applicationOptions.scanPath] The path to scan for `@Component`
   *  annotated exports. Defaults to a glob of all js files in ./dist (recursive)
   */
  async run(applicationOptions?: {
    envOverrides: Partial<ENV_VARS>;
    scanPath?: string;
  }) {
    applicationOptions = {
      envOverrides: {},
      scanPath: "./dist/**/*.js",
      ...applicationOptions
    };
    const { envOverrides, scanPath } = applicationOptions;
    // Proof of concept: classpath scanning
    const components = await ExportPathScanner.scan(scanPath!);

    // Container configuration step
    const container = createApplicationContainer();

    // Register env overrides for the envService
    container.register("ENV_OVERRIDES", asValue(envOverrides));

    // Register the node environment for injection
    container.register("NODE_ENV", asValue(process.env));

    // Register the DI container
    container.register("container", asValue(container));
    // Register the Environment Service. This data is used
    // by the context providers, so it needs to be built
    // very early on here.
    container.register("envService", asClass(EnvService).singleton());

    // Wire up our persistence layer. This is asynchronous and so needs
    // to have its own flow outside of the normal awilix instantiation
    // process.
    await container.build(OrmContext.configureContainer);

    // Wire up our web layer
    await container.build(WebserverContext.configureContainer);

    // Register all @components with our DI container
    await ComponentRegistrar.configureContainer(container, components);

    // Hook up middlewares and start the webserver listening
    const koaConfiguration = container.resolve("koaConfiguration");
    container.build(koaConfiguration.configure);

    return {
      shutdown: () => {
        container.build(({ orm, webserver }: ApplicationContext) => {
          orm.close();
          webserver.close();
        });
        container.dispose();
      },
      context: container.cradle
    };
  }
}

export interface ApplicationInstance {
  shutdown: () => void;
  context: ApplicationContext;
}

declare global {
  interface ApplicationContextMembers {
    /** The environment hash for this process */
    NODE_ENV: Partial<ENV_VARS>;
    /** The awilix container that holds this context */
    container: ContextContainer<ApplicationContext>;
    /** Service for interacting with the process env */
    envService: EnvService;
    /** Environmental overrides to be applied over-top of NODE_ENV  */
    ENV_OVERRIDES: Partial<ENV_VARS>;
  }
}
