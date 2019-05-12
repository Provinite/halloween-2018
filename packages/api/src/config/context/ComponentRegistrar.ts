import { asClass, asValue } from "awilix";
import { IScannableClass } from "../../reflection/ScannableClass";
import { lifeTime } from "../../reflection/Symbols";
import {
  ApplicationContainer,
  ApplicationContext,
  ContextContainer
} from "./ApplicationContext";
/**
 * @class ComponentRegistrar
 * Container configurator that registers @Component-annotated classes.
 */
export class ComponentRegistrar {
  /**
   * @inject
   * @static @method configureContainer - Configure the DI container with
   *    @Component's. Additionally:
   * Provides: {IScannableClass[]} container.ComponentList - A full list of all
   *    decorated component classes.
   * @param container - The DI container to configure.
   * @param components - The components to set up.
   * @return The modified container.
   */
  static configureContainer(
    container: ApplicationContainer,
    components: IScannableClass[]
  ): ApplicationContainer {
    components.forEach((componentClass: IScannableClass) => {
      container.register(
        ComponentRegistrar.getRegistrationName<ApplicationContext>(
          componentClass
        ),
        asClass(componentClass, { lifetime: componentClass[lifeTime] }) as any
      );
    });
    container.register("ComponentList", asValue(components.map(_ => _)));
    return container;
  }

  /**
   * Get the registration name for a class in the application context. If a
   * container is provided, this function will throw an error if it is not
   * registered in that container.
   * @param componentClass - The class to get a name for
   * @param container - The container to check for
   * @template T - The return type will be keyof T for convenience with strict
   *  container types. Defaults to `any`, resulting in a return type of `string`
   * @return The registration name for the class
   */
  static getRegistrationName<T = any>(
    componentClass: IScannableClass,
    container?: ContextContainer<T>
  ): keyof T {
    const result =
      componentClass.name[0].toLowerCase() + componentClass.name.substr(1);
    if (!container) {
      return result as keyof T;
    }
    if (container.registrations.hasOwnProperty(result)) {
      return result as keyof T;
    } else {
      throw new Error("Registration not found.");
    }
  }
}

declare global {
  interface ApplicationContextMembers {
    ComponentList: IScannableClass[];
  }
}
