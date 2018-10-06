import { createContainer, InjectionMode } from "awilix";
import { ComponentRegistrar } from "./config/context/ComponentRegistrar";
import { OrmContext } from "./config/context/OrmContext";
import { WebserverContext } from "./config/context/WebserverContext";
import { KoaConfiguration } from "./config/KoaConfiguration";
import { IHalloweenAppRunner } from "./IHalloweenAppRunner";
import { ExportPathScanner } from "./reflection/ExportPathScanner";

export class HalloweenAppDevRunner implements IHalloweenAppRunner {
  async run(): Promise<void> {
    // Proof of concept: classpath scanning
    const components = await ExportPathScanner.scan("./dist/**/*.js");
    // Container configuration step

    // Proof of concept: automatic bean instantiation
    const container = createContainer({
      injectionMode: InjectionMode.CLASSIC
    });

    // Wire up our persistence layer. This is asynchronous and so needs
    // to have its own flow outside of the normal awilix instantiation
    // process.
    await OrmContext.configureContainer(container);

    // Wire up our web layer
    // Since this stuff is synchronous, we could actually do this as an
    // @Component
    await WebserverContext.configureContainer(container);

    // Register all @components with our DI container
    ComponentRegistrar.configureContainer(container, components);

    // Arbitrary entry point for the DI-controlled portion of the app.
    const koaConfiguration: KoaConfiguration =
      container.cradle.koaConfiguration;
    koaConfiguration.configure();
  }
}
