import { asClass, asValue, AwilixContainer } from "awilix";
import { isRouter } from "../decorators/IRouterClass";
import { IScannableClass } from "../decorators/ScannableClass";
import { routableMethods } from "../decorators/Symbols";
/**
 * @class ComponentRegistrar
 * Container configurator that registers @Component-annotated classes.
 */
export class ComponentRegistrar {
  /**
   * @static @method configureContainer - Configure the DI container with
   *    @Component's. Additionally:
   * Provides: {IScannableClass[]} container.ComponentList - A full list of all
   *    decorated component classes.
   * Provides: {AwilixContainer} container - The root DI container for the
   *    application.
   * @param {AwilixContainer} container - The DI container to configure.
   * @param {IScannableClass[]} components - The components to set up.
   * @return {AwilixContainer} The modified container.
   */
  static configureContainer(
    container: AwilixContainer,
    components: IScannableClass[]
  ): AwilixContainer {
    components.forEach((componentClass: IScannableClass) => {
      container.register(
        ComponentRegistrar.getRegistrationName(componentClass),
        asClass(componentClass)
      );
    });
    container.register("ComponentList", asValue(components.map(_ => _)));

    // Injecting the entire container allows us to mix and match a bit on DI
    // injection modes. It would be preferable to give `@Component` a param that
    // controls the injection mode for the registration. This works for now though.
    container.register("container", asValue(container));
    return container;
  }

  static getRegistrationName(componentClass: IScannableClass): string {
    return componentClass.name[0].toLowerCase() + componentClass.name.substr(1);
  }
}
