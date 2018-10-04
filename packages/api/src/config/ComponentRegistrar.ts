import { asClass, asValue, AwilixContainer } from "awilix";
import { IScannableClass } from "../decorators/ScannableClass";
/**
 * @class ComponentRegistrar
 * Container configurator that registers @Component-annotated classes.
 */
export class ComponentRegistrar {
  /**
   * @static @method configureContainer
   * @param {AwilixContainer} container - The DI container to configure.
   * @param {IScannableClass[]} components - The components to set up.
   * @return {AwilixContainer} The modified container.
   */
  static configureContainer(
    container: AwilixContainer,
    components: IScannableClass[]
  ): AwilixContainer {
    components.forEach((componentClass: IScannableClass) => {
      let name = componentClass.name;
      name = name[0].toLowerCase() + name.substr(1);
      container.register(name, asClass(componentClass));
    });

    container.register("ComponentList", asValue(components.map(_ => _)));

    return container;
  }
}
