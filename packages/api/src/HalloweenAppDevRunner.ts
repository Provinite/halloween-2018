import { asClass, asValue, createContainer } from "awilix";
import {
  ApplicationContainer,
  ApplicationContext,
  ContextContainer
} from "./config/context/ApplicationContext";
import { ComponentRegistrar } from "./config/context/ComponentRegistrar";
import { OrmContext } from "./config/context/OrmContext";
import { WebserverContext } from "./config/context/WebserverContext";
import { ENV_VARS } from "./config/env/ENV_VARS";
import { EnvService } from "./config/env/EnvService";
import { IHalloweenAppRunner } from "./IHalloweenAppRunner";
import { ExportPathScanner } from "./reflection/ExportPathScanner";

export class HalloweenAppDevRunner implements IHalloweenAppRunner {
  async run(): Promise<void> {
    // Proof of concept: classpath scanning
    const components = await ExportPathScanner.scan("./dist/**/*.js");
    // Container configuration step
    const container = createContainer() as ApplicationContainer;

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
  }
}

declare global {
  interface ApplicationContextMembers {
    /** The environment hash for this process */
    NODE_ENV: Partial<ENV_VARS>;
    /** The awilix container that holds this context */
    container: ContextContainer<ApplicationContext>;
    /** Service for interacting with the process env */
    envService: EnvService;
  }
}
