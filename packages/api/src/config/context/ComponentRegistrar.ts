import { asClass, asValue, AwilixContainer } from "awilix";
import { IScannableClass } from "../../reflection/ScannableClass";
import { lifeTime } from "../../reflection/Symbols";
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
        asClass(componentClass, { lifetime: componentClass[lifeTime] })
      );
    });
    container.register("ComponentList", asValue(components.map(_ => _)));
    return container;
  }

  static getRegistrationName(componentClass: IScannableClass): string {
    return componentClass.name[0].toLowerCase() + componentClass.name.substr(1);
  }
}

declare global {
  interface ApplicationContextMembers {
    ComponentList: IScannableClass[];
  }
}
