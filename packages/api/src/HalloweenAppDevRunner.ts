import { asClass, asValue, createContainer, InjectionMode } from "awilix";
import { asStaticMethod } from "./AwilixHelpers";
import { ComponentRegistrar } from "./config/context/ComponentRegistrar";
import { OrmContext } from "./config/context/OrmContext";
import { WebserverContext } from "./config/context/WebserverContext";
import { EnvService } from "./config/env/EnvService";
import { KoaConfiguration } from "./config/KoaConfiguration";
import { IHalloweenAppRunner } from "./IHalloweenAppRunner";
import { ExportPathScanner } from "./reflection/ExportPathScanner";

export class HalloweenAppDevRunner implements IHalloweenAppRunner {
  async run(): Promise<void> {
    // Proof of concept: classpath scanning
    const components = await ExportPathScanner.scan("./dist/**/*.js");
    // Container configuration step
    const container = createContainer({
      injectionMode: InjectionMode.CLASSIC
    });

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
    await container.build(asStaticMethod(OrmContext.configureContainer));

    // Wire up our web layer
    await container.build(asStaticMethod(WebserverContext.configureContainer));

    // Register all @components with our DI container
    await ComponentRegistrar.configureContainer(container, components);

    // Hook up middlewares and start the webserver listening
    const koaConfiguration: KoaConfiguration =
      container.cradle.koaConfiguration;
    koaConfiguration.configure();
  }
}
