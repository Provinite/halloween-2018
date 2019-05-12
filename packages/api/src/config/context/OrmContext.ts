import { asFunction, asValue, AwilixContainer, Lifetime } from "awilix";
import { Connection, createConnection, EntityManager } from "typeorm";
import { asStaticMethod } from "../../AwilixHelpers";
import { MODELS } from "../../models";
import { getRepositoryFor } from "../../models/modelUtils";
import { EnvService } from "../env/EnvService";

/**
 * Create a repository name for the given model.
 * @param model - A model class.
 */
export function createRepositoryName(model: Function) {
  let name: string = model.name;
  name = name[0].toLowerCase() + name.substr(1);
  name += "Repository";
  return name;
}
/**
 * @class OrmContext
 * Container configuration class to provide access to the persistence layer.
 */
export class OrmContext {
  /**
   * @static @method configureContainer
   * Configures the DI container with ORM related registrations.
   * @configures {typeorm.Connection} orm
   * @configures {typeorm.Repository} [model]Repository for each model.
   */
  static async configureContainer(
    container: AwilixContainer,
    envService: EnvService
  ) {
    const config = {
      ...envService.getOrmConfiguration(),
      entities: MODELS
    };
    // Create the typeorm connection
    const connection: Connection = await createConnection(config as any);

    // Register the ORM connection.
    container.register("orm", asValue(connection));
    // make a proxy to always grab the "manager" off of the current container's
    // ORM
    container.register(
      "manager",
      asFunction((orm: Connection) => orm.manager, {
        lifetime: Lifetime.TRANSIENT
      })
    );

    MODELS.forEach(model => {
      // Register a scoped repository for each model.
      const name = createRepositoryName(model);
      const proxy = (manager: EntityManager) =>
        getRepositoryFor(manager, model);
      const resolver = asFunction(proxy);
      container.register(name, resolver);
    });

    // Fire off createInitialEntites for each model
    await Promise.all(
      MODELS.map(model =>
        model.createInitialEntities
          ? container.build(asStaticMethod(model.createInitialEntities))
          : Promise.resolve()
      )
    );

    return container;
  }
}

declare global {
  interface ApplicationContext {
    /** The typeorm connection for the application */
    orm: Connection;
    /** The entity manager for this container */
    manager: EntityManager;
  }
}
